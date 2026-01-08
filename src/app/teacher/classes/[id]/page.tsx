import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button } from '@/components/ui';
import { ArrowLeft, Plus, ClipboardList, Share2, Trash2 } from 'lucide-react';
import { DeleteClassButton } from './DeleteClassButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  const { data: classData, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error || !classData) {
    notFound();
  }

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, submissions(count)')
    .eq('class_id', id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/teacher/classes"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách lớp
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              {classData.description && (
                <p className="text-gray-500 mt-1">{classData.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/teacher/assignments/new?class_id=${id}`}>
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo bài tập
                </Button>
              </Link>
              <DeleteClassButton classId={id} className={classData.name} />
            </div>
          </div>
        </div>

        {/* Assignments list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bài tập trong lớp</h2>

          {assignments && assignments.length > 0 ? (
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
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                            <ClipboardList className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                            <p className="text-sm text-gray-500">
                              {assignment.submissions?.[0]?.count || 0} bài nộp
                              {assignment.due_date && (
                                <> • Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Share2 className="w-4 h-4" />
                          <span className="font-mono">{assignment.share_token}</span>
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
                  Chưa có bài tập nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Tạo bài tập đầu tiên cho lớp này
                </p>
                <Link href={`/teacher/assignments/new?class_id=${id}`}>
                  <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo bài tập
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
