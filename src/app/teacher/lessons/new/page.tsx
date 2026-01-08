'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { ArrowLeft, Plus, Trash2, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { nanoid } from 'nanoid';

interface VocabularyForm {
  id: string;
  word: string;
  meaning: string;
}

// Use Web Speech API for text-to-speech
function speakText(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  }
}

export default function NewLessonPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showMeaning, setShowMeaning] = useState(true);
  const [vocabulary, setVocabulary] = useState<VocabularyForm[]>([
    { id: nanoid(), word: '', meaning: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const addVocabulary = () => {
    setVocabulary([...vocabulary, { id: nanoid(), word: '', meaning: '' }]);
  };

  const removeVocabulary = (id: string) => {
    if (vocabulary.length > 1) {
      setVocabulary(vocabulary.filter((v) => v.id !== id));
    }
  };

  const updateVocabulary = (id: string, field: 'word' | 'meaning', value: string) => {
    setVocabulary(
      vocabulary.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validVocabulary = vocabulary.filter((v) => v.word.trim());
    if (validVocabulary.length === 0) {
      setError('Vui lòng thêm ít nhất một từ vựng');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vui lòng đăng nhập lại');
        setIsLoading(false);
        return;
      }

      const shareToken = nanoid(10);

      // Create lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          teacher_id: user.id,
          title,
          description: description || null,
          show_meaning: showMeaning,
          share_token: shareToken,
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Create vocabulary items
      for (let i = 0; i < validVocabulary.length; i++) {
        const v = validVocabulary[i];
        await supabase.from('vocabulary').insert({
          lesson_id: lesson.id,
          order_index: i,
          word: v.word.trim(),
          meaning: v.meaning.trim() || null,
        });
      }

      router.push(`/teacher/lessons/${lesson.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError('Không thể tạo bài học. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/teacher/lessons"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tạo bài học mới</h1>
          <p className="text-gray-500 mt-1">
            Tạo bài học từ vựng theo chủ đề cho học sinh
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-gray-900">Thông tin bài học</h2>

              <Input
                id="title"
                label="Chủ đề bài học"
                placeholder="VD: Fruits, Colors, Animals..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Mô tả ngắn về bài học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showMeaning"
                  checked={showMeaning}
                  onChange={(e) => setShowMeaning(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showMeaning" className="text-sm text-gray-700">
                  Hiển thị nghĩa tiếng Việt cho học sinh
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-gray-900">
                Danh sách từ vựng ({vocabulary.length})
              </h2>
              <p className="text-sm text-gray-500">
                Nhập từ/cụm từ tiếng Anh và nghĩa tiếng Việt
              </p>

              <div className="space-y-3">
                {vocabulary.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Từ tiếng Anh (VD: Apple)"
                            value={item.word}
                            onChange={(e) =>
                              updateVocabulary(item.id, 'word', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Nghĩa tiếng Việt (VD: Quả táo)"
                            value={item.meaning}
                            onChange={(e) =>
                              updateVocabulary(item.id, 'meaning', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => speakText(item.word)}
                          disabled={!item.word.trim()}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        {vocabulary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVocabulary(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={addVocabulary}
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm từ vựng
              </Button>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/teacher/lessons">
              <Button type="button" variant="secondary">
                Hủy
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Tạo bài học
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
