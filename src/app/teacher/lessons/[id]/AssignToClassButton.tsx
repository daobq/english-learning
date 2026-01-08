'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Users, X, Loader2 } from 'lucide-react';

interface AssignToClassButtonProps {
  lessonId: string;
  lessonTitle: string;
  classes: { id: string; name: string }[];
  existingAssignments: (string | null)[];
}

export function AssignToClassButton({
  lessonId,
  lessonTitle,
  classes,
  existingAssignments,
}: AssignToClassButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out already assigned classes
  const availableClasses = classes.filter(
    (c) => !existingAssignments.includes(c.id)
  );

  const handleAssign = async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase.from('assignments').insert({
        lesson_id: lessonId,
        class_id: selectedClass,
        due_date: dueDate || null,
        title: lessonTitle,
        share_token: `${lessonId.slice(0, 8)}-${selectedClass.slice(0, 4)}`,
      });

      if (insertError) throw insertError;

      setShowModal(false);
      setSelectedClass('');
      setDueDate('');
      router.refresh();
    } catch (err) {
      console.error('Error assigning lesson:', err);
      setError('Không thể giao bài. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (availableClasses.length === 0 && classes.length > 0) {
    return (
      <Button variant="secondary" disabled>
        <Users className="w-5 h-5 mr-2" />
        Đã giao tất cả lớp
      </Button>
    );
  }

  if (classes.length === 0) {
    return (
      <Button variant="secondary" disabled>
        <Users className="w-5 h-5 mr-2" />
        Chưa có lớp học
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <Users className="w-5 h-5 mr-2" />
        Giao bài cho lớp
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Giao bài cho lớp
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn lớp
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn lớp --</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn nộp (tùy chọn)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAssign}
                  disabled={!selectedClass || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Giao bài'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
