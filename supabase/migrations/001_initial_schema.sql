-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table (lớp học)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table (bài tập)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  share_token VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (câu hỏi)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  text_content TEXT NOT NULL,
  audio_url TEXT,
  question_type VARCHAR(20) NOT NULL DEFAULT 'listen_repeat' CHECK (question_type IN ('listen_repeat', 'listen_choose')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table (bài làm)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Answers table (câu trả lời)
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  teacher_score INTEGER CHECK (teacher_score >= 0 AND teacher_score <= 100),
  teacher_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_share_token ON assignments(share_token);
CREATE INDEX idx_questions_assignment_id ON questions(assignment_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_answers_submission_id ON answers(submission_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Classes: Teachers can only see/modify their own classes
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Assignments: Teachers can manage assignments for their classes
CREATE POLICY "Teachers can view own assignments" ON assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can insert assignments" ON assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can update own assignments" ON assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can delete own assignments" ON assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid())
  );

-- Public access for assignments via share_token (for students)
CREATE POLICY "Anyone can view assignments by share_token" ON assignments
  FOR SELECT USING (true);

-- Questions: Same as assignments
CREATE POLICY "Teachers can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN classes ON classes.id = assignments.class_id
      WHERE assignments.id = questions.assignment_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

-- Submissions: Anyone can create, teachers can view
CREATE POLICY "Anyone can create submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view submissions" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Teachers can update submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN classes ON classes.id = assignments.class_id
      WHERE assignments.id = submissions.assignment_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Answers: Anyone can create/view
CREATE POLICY "Anyone can create answers" ON answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view answers" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Teachers can update answers" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      JOIN classes ON classes.id = assignments.class_id
      WHERE submissions.id = answers.submission_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Anyone can upload to audio bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio');
