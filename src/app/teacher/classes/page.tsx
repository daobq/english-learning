import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, Users, ChevronRight } from 'lucide-react';

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('*, assignments(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lớp học</h1>
            <p className="text-gray-500 mt-1">Quản lý các lớp học của bạn</p>
          </div>
          <Link href="/teacher/classes/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Tạo lớp mới
            </Button>
          </Link>
        </div>

        {/* Classes list */}
        {classes && classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                        </div>
                        {cls.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {cls.assignments?.[0]?.count || 0} bài tập
                        </p>
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
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
              <p className="text-gray-500 mb-6">Tạo lớp học đầu tiên để bắt đầu giao bài tập</p>
              <Link href="/teacher/classes/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lớp mới
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
