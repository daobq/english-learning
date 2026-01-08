import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';

export default async function LessonsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Get all lessons with vocabulary count
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, vocabulary(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bài học</h1>
            <p className="text-gray-500 mt-1">Quản lý các bài học từ vựng theo chủ đề</p>
          </div>
          <Link href="/teacher/lessons/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Tạo bài học
            </Button>
          </Link>
        </div>

        {/* Lessons list */}
        {lessons && lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/teacher/lessons/${lesson.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          <span>{lesson.vocabulary?.[0]?.count || 0} từ vựng</span>
                          <span>•</span>
                          <span>{lesson.show_meaning ? 'Có nghĩa VN' : 'Không có nghĩa'}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài học nào</h3>
              <p className="text-gray-500 mb-6">Tạo bài học đầu tiên với danh sách từ vựng theo chủ đề</p>
              <Link href="/teacher/lessons/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo bài học
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
