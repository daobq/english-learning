import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button } from '@/components/ui';
import { ArrowLeft, Share2, Users } from 'lucide-react';
import { CopyLinkButton } from './CopyLinkButton';
import { AssignToClassButton } from './AssignToClassButton';
import { VocabularyAudioButton } from './VocabularyAudioButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Get lesson
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error || !lesson) {
    notFound();
  }

  // Get vocabulary
  const { data: vocabulary } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('lesson_id', id)
    .order('order_index');

  // Get classes for assignment
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)
    .order('name');

  // Get existing assignments for this lesson
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, classes(name), submissions(count)')
    .eq('lesson_id', id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/teacher/lessons"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách bài học
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-gray-500 mt-1">{lesson.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {vocabulary?.length || 0} từ vựng •{' '}
                {lesson.show_meaning ? 'Hiển thị nghĩa VN' : 'Không hiển thị nghĩa'}
              </p>
            </div>
            <AssignToClassButton
              lessonId={id}
              lessonTitle={lesson.title}
              classes={classes || []}
              existingAssignments={assignments?.map((a) => a.class_id) || []}
            />
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
                  <p className="font-medium text-gray-900">Link chia sẻ trực tiếp</p>
                  <p className="text-sm text-purple-600 font-mono">
                    /do/{lesson.share_token}
                  </p>
                </div>
              </div>
              <CopyLinkButton shareToken={lesson.share_token} />
            </div>
          </CardContent>
        </Card>

        {/* Assigned classes */}
        {assignments && assignments.length > 0 && (
          <Card>
            <CardContent>
              <h2 className="font-semibold text-gray-900 mb-4">
                Đã giao cho ({assignments.length} lớp)
              </h2>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">
                        {assignment.classes?.name || 'Lớp không xác định'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.submissions?.[0]?.count || 0} bài nộp
                      {assignment.due_date && (
                        <> • Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vocabulary list */}
        <Card>
          <CardContent>
            <h2 className="font-semibold text-gray-900 mb-4">
              Danh sách từ vựng ({vocabulary?.length || 0})
            </h2>
            <div className="space-y-2">
              {vocabulary?.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 bg-gray-50 rounded-xl"
                >
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-lg">{item.word}</p>
                    {item.meaning && (
                      <p className="text-sm text-gray-500">{item.meaning}</p>
                    )}
                  </div>
                  <VocabularyAudioButton word={item.word} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
