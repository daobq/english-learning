import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, ClipboardList, Share2, Users, BookOpen, ChevronRight } from 'lucide-react';

export default async function AssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Get all lessons for this teacher to find their assignments
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('teacher_id', user.id);

  const lessonIds = lessons?.map((l) => l.id) || [];
  const lessonMap = new Map(lessons?.map((l) => [l.id, l.title]) || []);

  // Get all assignments for these lessons with class info
  let assignments: any[] = [];
  if (lessonIds.length > 0) {
    const { data } = await supabase
      .from('assignments')
      .select('*, classes(name), submissions(count)')
      .in('lesson_id', lessonIds)
      .order('created_at', { ascending: false });
    assignments = data || [];
  }

  // Check if user has lessons and classes
  const { count: lessonCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const { count: classCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const hasLessons = (lessonCount || 0) > 0;
  const hasClasses = (classCount || 0) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giao bài</h1>
            <p className="text-gray-500 mt-1">Quản lý các bài học đã giao cho lớp</p>
          </div>
        </div>

        {/* Check prerequisites */}
        {!hasLessons ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài học nào
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn cần tạo bài học trước khi có thể giao bài cho lớp
              </p>
              <Link href="/teacher/lessons/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo bài học
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : !hasClasses ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có lớp học nào
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn cần tạo lớp học trước khi có thể giao bài
              </p>
              <Link href="/teacher/classes/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lớp học
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/teacher/assignments/${assignment.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <ClipboardList className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lessonMap.get(assignment.lesson_id) || assignment.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{assignment.classes?.name || 'Lớp không xác định'}</span>
                            <span>•</span>
                            <span>{assignment.submissions?.[0]?.count || 0} bài nộp</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Share2 className="w-4 h-4" />
                            <span className="font-mono text-xs">{assignment.share_token}</span>
                          </div>
                          {assignment.due_date && (
                            <p className="text-xs text-gray-400 mt-1">
                              Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa giao bài học nào
              </h3>
              <p className="text-gray-500 mb-6">
                Vào trang Bài học để giao bài cho các lớp
              </p>
              <Link href="/teacher/lessons">
                <Button>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Xem bài học
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
