import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Users, ClipboardList, FileAudio, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Fetch statistics
  const { count: classCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const { count: lessonCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('teacher_id', user.id);

  const lessonIds = lessons?.map((l) => l.id) || [];

  let assignmentCount = 0;
  let submissionCount = 0;

  if (lessonIds.length > 0) {
    const { count: aCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .in('lesson_id', lessonIds);
    assignmentCount = aCount || 0;

    const { data: assignments } = await supabase
      .from('assignments')
      .select('id')
      .in('lesson_id', lessonIds);

    const assignmentIds = assignments?.map((a) => a.id) || [];

    if (assignmentIds.length > 0) {
      const { count: sCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds);
      submissionCount = sCount || 0;
    }
  }

  const stats = [
    { label: 'Lớp học', value: classCount || 0, icon: Users, color: 'blue', href: '/teacher/classes' },
    { label: 'Bài học', value: lessonCount || 0, icon: GraduationCap, color: 'green', href: '/teacher/lessons' },
    { label: 'Đã giao', value: assignmentCount, icon: ClipboardList, color: 'purple', href: '/teacher/assignments' },
    { label: 'Bài nộp', value: submissionCount, icon: FileAudio, color: 'orange', href: '/teacher/assignments' },
  ];

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Giáo viên';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {userName}!
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý bài tập luyện nghe nói tiếng Anh của bạn
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const bgColor = {
              blue: 'bg-blue-100',
              green: 'bg-green-100',
              purple: 'bg-purple-100',
              orange: 'bg-orange-100',
            }[stat.color];
            const textColor = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              purple: 'text-purple-600',
              orange: 'text-orange-600',
            }[stat.color];
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${bgColor}`}
                    >
                      <Icon className={`w-6 h-6 ${textColor}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/teacher/classes/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-300">
                <CardContent className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">Tạo lớp học mới</p>
                  <p className="text-sm text-gray-500 mt-1">Thêm một lớp học để quản lý học sinh</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teacher/lessons/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-200 hover:border-green-300">
                <CardContent className="text-center py-8">
                  <GraduationCap className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">Tạo bài học mới</p>
                  <p className="text-sm text-gray-500 mt-1">Tạo bài học từ vựng theo chủ đề</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
