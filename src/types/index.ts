// Database types

export interface Teacher {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// NEW: Lesson (bài học theo chủ đề)
export interface Lesson {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  show_meaning: boolean;
  share_token: string;
  created_at: string;
}

// NEW: Vocabulary (từ vựng trong bài học)
export interface Vocabulary {
  id: string;
  lesson_id: string;
  order_index: number;
  word: string;
  meaning: string | null;
  created_at: string;
}

// Updated: Assignment now links to Lesson
export interface Assignment {
  id: string;
  lesson_id: string | null;
  class_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  share_token: string;
  created_at: string;
}

// Legacy: Question (kept for backwards compatibility)
export interface Question {
  id: string;
  assignment_id: string;
  order_index: number;
  text_content: string;
  audio_url: string | null;
  question_type: 'listen_repeat' | 'listen_choose';
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_name: string;
  created_at: string;
  completed_at: string | null;
}

// Updated: Answer now can reference vocabulary_id
export interface Answer {
  id: string;
  submission_id: string;
  question_id: string | null;
  vocabulary_id: string | null;
  audio_url: string | null;
  transcript: string | null;
  ai_score: number | null;
  teacher_score: number | null;
  teacher_feedback: string | null;
  created_at: string;
}

// Extended types with relations
export interface LessonWithVocabulary extends Lesson {
  vocabulary: Vocabulary[];
}

export interface LessonWithCount extends Lesson {
  vocabulary_count: number;
  assignments_count: number;
}

export interface AssignmentWithLesson extends Assignment {
  lesson: Lesson;
  class: Class | null;
}

export interface AssignmentWithQuestions extends Assignment {
  questions: Question[];
}

export interface AssignmentWithClass extends Assignment {
  class: Class;
}

export interface SubmissionWithAnswers extends Submission {
  answers: Answer[];
}

export interface AnswerWithQuestion extends Answer {
  question: Question;
}

export interface AnswerWithVocabulary extends Answer {
  vocabulary: Vocabulary;
}

// Form types
export interface CreateClassForm {
  name: string;
  description?: string;
}

export interface CreateLessonForm {
  title: string;
  description?: string;
  show_meaning: boolean;
  vocabulary: CreateVocabularyForm[];
}

export interface CreateVocabularyForm {
  word: string;
  meaning?: string;
}

export interface CreateAssignmentForm {
  lesson_id: string;
  class_id: string;
  due_date?: string;
}

// Legacy form types
export interface CreateQuestionForm {
  text_content: string;
  question_type: 'listen_repeat' | 'listen_choose';
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
