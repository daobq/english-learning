import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { AnswerReview } from './AnswerReview';
import { VocabularyAudioButton } from './VocabularyAudioButton';

interface PageProps {
  params: Promise<{ id: string; submissionId: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id: assignmentId, submissionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Get submission with answers and lesson info
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        id,
        title,
        lesson_id,
        lessons!inner(
          id,
          title,
          teacher_id,
          show_meaning
        )
      ),
      answers(
        *,
        vocabulary(*)
      )
    `)
    .eq('id', submissionId)
    .single();

  if (error || !submission || submission.assignments.lessons.teacher_id !== user.id) {
    notFound();
  }

  // Get all vocabulary for the lesson
  const { data: vocabulary } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('lesson_id', submission.assignments.lesson_id)
    .order('order_index');

  // Map answers to vocabulary
  const answersMap = new Map(
    submission.answers.map((a: any) => [a.vocabulary_id, a])
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/teacher/assignments/${assignmentId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bài làm của {submission.student_name}
              </h1>
              <p className="text-gray-500 mt-1">
                {submission.assignments.lessons.title} •
                Nộp lúc {new Date(submission.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Vocabulary Answers */}
        <div className="space-y-4">
          {vocabulary?.map((item: any, index: number) => {
            const answer = answersMap.get(item.id);

            return (
              <Card key={item.id}>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 space-y-4">
                      {/* Vocabulary word */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Từ vựng:</p>
                          <p className="text-xl font-bold text-gray-900">
                            {item.word}
                          </p>
                          {item.meaning && submission.assignments.lessons.show_meaning && (
                            <p className="text-gray-500">{item.meaning}</p>
                          )}
                        </div>
                        <VocabularyAudioButton word={item.word} />
                      </div>

                      {/* Answer */}
                      {answer ? (
                        <AnswerReview
                          answer={answer as any}
                          vocabularyWord={item.word}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                          Chưa phát âm từ này
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
