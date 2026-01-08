-- Migration: Convert from questions-based to vocabulary-based system
-- This migration adds lessons and vocabulary tables for word/phrase learning

-- =============================================
-- STEP 1: Create new tables
-- =============================================

-- Lessons table (bài học theo chủ đề)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  show_meaning BOOLEAN DEFAULT true,  -- Hiển thị nghĩa tiếng Việt cho học sinh
  share_token VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary table (từ vựng trong bài học)
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  word TEXT NOT NULL,           -- Từ/cụm từ tiếng Anh
  meaning TEXT,                 -- Nghĩa tiếng Việt (tùy chọn)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: Modify assignments table
-- =============================================

-- Add lesson_id column to assignments
ALTER TABLE assignments ADD COLUMN lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;

-- Make class_id optional (for backwards compatibility during migration)
ALTER TABLE assignments ALTER COLUMN class_id DROP NOT NULL;

-- =============================================
-- STEP 3: Modify answers table
-- =============================================

-- Add vocabulary_id column to answers
ALTER TABLE answers ADD COLUMN vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE;

-- Make question_id optional (for backwards compatibility)
ALTER TABLE answers ALTER COLUMN question_id DROP NOT NULL;

-- =============================================
-- STEP 4: Create indexes
-- =============================================

CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX idx_lessons_share_token ON lessons(share_token);
CREATE INDEX idx_vocabulary_lesson_id ON vocabulary(lesson_id);
CREATE INDEX idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX idx_answers_vocabulary_id ON answers(vocabulary_id);

-- =============================================
-- STEP 5: Row Level Security for new tables
-- =============================================

-- Enable RLS on lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Lessons: Teachers can manage their own lessons
CREATE POLICY "Teachers can view own lessons" ON lessons
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own lessons" ON lessons
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own lessons" ON lessons
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own lessons" ON lessons
  FOR DELETE USING (auth.uid() = teacher_id);

-- Anyone can view lessons by share_token (for students)
CREATE POLICY "Anyone can view lessons by share_token" ON lessons
  FOR SELECT USING (true);

-- Enable RLS on vocabulary
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Vocabulary: Teachers can manage vocabulary in their lessons
CREATE POLICY "Teachers can manage vocabulary" ON vocabulary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = vocabulary.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Anyone can view vocabulary (for students)
CREATE POLICY "Anyone can view vocabulary" ON vocabulary
  FOR SELECT USING (true);

-- =============================================
-- STEP 6: Update assignments policies for lesson_id
-- =============================================

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Teachers can view own assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can insert assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can update own assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can delete own assignments" ON assignments;

-- New policies supporting both old (class_id) and new (lesson_id) structure
CREATE POLICY "Teachers can view own assignments" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM lessons WHERE lessons.id = assignments.lesson_id AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert assignments" ON assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = class_id AND classes.teacher_id = auth.uid()
    )
    AND (
      lesson_id IS NULL OR
      EXISTS (
        SELECT 1 FROM lessons WHERE lessons.id = lesson_id AND lessons.teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can update own assignments" ON assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM lessons WHERE lessons.id = assignments.lesson_id AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete own assignments" ON assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM lessons WHERE lessons.id = assignments.lesson_id AND lessons.teacher_id = auth.uid()
    )
  );
