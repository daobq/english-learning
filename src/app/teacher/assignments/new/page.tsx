'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { ArrowLeft, Plus, Trash2, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { nanoid } from 'nanoid';

interface QuestionForm {
  id: string;
  text_content: string;
}

// Use Web Speech API for text-to-speech
function speakText(text: string, lang: string = 'en-US') {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // Slower for children
    utterance.pitch = 1;

    // Try to find an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes('Female')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    alert('Trình duyệt không hỗ trợ đọc văn bản');
  }
}

function NewAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClassId = searchParams.get('class_id');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState(preselectedClassId || '');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { id: nanoid(), text_content: '' },
  ]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load voices when component mounts
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    async function fetchClasses() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id)
          .order('name');

        if (data) {
          setClasses(data);
          if (!classId && data.length > 0) {
            setClassId(data[0].id);
          }
        }
      }
    }

    fetchClasses();
  }, [classId]);

  const addQuestion = () => {
    setQuestions([...questions, { id: nanoid(), text_content: '' }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, text_content: text } : q))
    );
  };

  const previewQuestion = (text: string) => {
    if (text.trim()) {
      speakText(text);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validQuestions = questions.filter((q) => q.text_content.trim());
    if (validQuestions.length === 0) {
      setError('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const shareToken = nanoid(10);

      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          class_id: classId,
          title,
          description: description || null,
          due_date: dueDate || null,
          share_token: shareToken,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create questions (audio will be generated on-the-fly using Web Speech API)
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];

        await supabase.from('questions').insert({
          assignment_id: assignment.id,
          order_index: i,
          text_content: q.text_content,
          audio_url: null, // Will use Web Speech API on client
          question_type: 'listen_repeat',
        });
      }

      router.push(`/teacher/assignments/${assignment.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Không thể tạo bài tập. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/teacher/assignments"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tạo bài tập mới</h1>
          <p className="text-gray-500 mt-1">
            Tạo bài tập luyện nghe nói cho học sinh
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-gray-900">Thông tin bài tập</h2>

              <Input
                id="title"
                label="Tiêu đề bài tập"
                placeholder="VD: Bài 1 - Chào hỏi cơ bản"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lớp học
                </label>
                <select
                  id="class"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  id="description"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn về bài tập..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Input
                id="dueDate"
                type="date"
                label="Hạn nộp (tùy chọn)"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-gray-900">
                Câu hỏi ({questions.length})
              </h2>
              <p className="text-sm text-gray-500">
                Nhập nội dung tiếng Anh để học sinh nghe và nói lại
              </p>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: Hello, my name is John."
                          value={question.text_content}
                          onChange={(e) =>
                            updateQuestion(question.id, e.target.value)
                          }
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Preview button */}
                    <div className="flex items-center gap-2 ml-11">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => previewQuestion(question.text_content)}
                        disabled={!question.text_content.trim()}
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Nghe thử
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm câu hỏi
              </Button>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/teacher/assignments">
              <Button type="button" variant="secondary">
                Hủy
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Tạo bài tập
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewAssignmentContent />
    </Suspense>
  );
}
