import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ExerciseClient } from './ExerciseClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ExercisePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // First, try to find assignment by share token
  const { data: assignment } = await supabase
    .from('assignments')
    .select('*, lessons!inner(id, title, description, show_meaning)')
    .eq('share_token', token)
    .single();

  if (assignment) {
    // Found assignment - get vocabulary for the lesson
    const { data: vocabulary } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('lesson_id', assignment.lesson_id)
      .order('order_index');

    return (
      <ExerciseClient
        assignment={{
          id: assignment.id,
          title: assignment.lessons.title,
          description: assignment.lessons.description,
        }}
        vocabulary={vocabulary || []}
        showMeaning={assignment.lessons.show_meaning}
      />
    );
  }

  // If no assignment found, try to find lesson by share token (direct access)
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('share_token', token)
    .single();

  if (lesson) {
    // Found lesson - get vocabulary
    const { data: vocabulary } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('order_index');

    return (
      <ExerciseClient
        assignment={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
        }}
        vocabulary={vocabulary || []}
        showMeaning={lesson.show_meaning}
        isDirectLesson={true}
      />
    );
  }

  // Neither assignment nor lesson found
  notFound();
}
