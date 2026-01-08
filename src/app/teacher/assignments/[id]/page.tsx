import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  ClipboardList,
  FileAudio,
  Users,
  Volume2,
} from 'lucide-react';
import { CopyLinkButton } from './CopyLinkButton';
import { VocabularyAudioButton } from './VocabularyAudioButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Get assignment with lesson and class info
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*, lessons!inner(id, title, teacher_id, show_meaning), classes!inner(id, name)')
    .eq('id', id)
    .single();

  if (error || !assignment || assignment.lessons.teacher_id !== user.id) {
    notFound();
  }

  // Get vocabulary for this lesson
  const { data: vocabulary } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('lesson_id', assignment.lesson_id)
    .order('order_index');

  // Get submissions with answers
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, answers(*, vocabulary(word))')
    .eq('assignment_id', id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/teacher/assignments"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {assignment.lessons.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Users className="w-4 h-4" />
                <span>{assignment.classes.name}</span>
                {assignment.due_date && (
                  <>
                    <span>•</span>
                    <span>Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Share link */}
        <Card className="bg-purple-50 border-purple-100">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Link làm bài cho học sinh
                  </p>
                  <p className="text-sm text-purple-600 font-mono">
                    /do/{assignment.share_token}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <CopyLinkButton shareToken={assignment.share_token} />
                <Link
                  href={`/do/${assignment.share_token}`}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem thử
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary */}
        <Card>
          <CardContent>
            <h2 className="font-semibold text-gray-900 mb-4">
              Danh sách từ vựng ({vocabulary?.length || 0})
            </h2>
            <div className="space-y-2">
              {vocabulary?.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center p-3 bg-gray-50 rounded-xl"
                >
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.word}</p>
                    {item.meaning && assignment.lessons.show_meaning && (
                      <p className="text-sm text-gray-500">{item.meaning}</p>
                    )}
                  </div>
                  <VocabularyAudioButton word={item.word} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card>
          <CardContent>
            <h2 className="font-semibold text-gray-900 mb-4">
              Bài nộp ({submissions?.length || 0})
            </h2>

            {submissions && submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const answeredCount =
                    submission.answers?.filter((a: any) => a.audio_url).length || 0;
                  const totalVocabulary = vocabulary?.length || 0;
                  const avgScore =
                    submission.answers?.reduce(
                      (sum: number, a: any) => sum + (a.ai_score || 0),
                      0
                    ) / (answeredCount || 1) || 0;

                  return (
                    <Link
                      key={submission.id}
                      href={`/teacher/assignments/${id}/submissions/${submission.id}`}
                    >
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                          <FileAudio className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {submission.student_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(submission.created_at).toLocaleString('vi-VN')} •{' '}
                            {answeredCount}/{totalVocabulary} từ
                          </p>
                        </div>
                        {answeredCount > 0 && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {Math.round(avgScore)}%
                            </p>
                            <p className="text-xs text-gray-500">AI Score</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có học sinh nào nộp bài</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
