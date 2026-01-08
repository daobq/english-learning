'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Trash2 } from 'lucide-react';

interface DeleteClassButtonProps {
  classId: string;
  className: string;
}

export function DeleteClassButton({ classId, className }: DeleteClassButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from('classes').delete().eq('id', classId);

    if (error) {
      alert('Không thể xóa lớp học. Vui lòng thử lại.');
      setIsDeleting(false);
      return;
    }

    router.push('/teacher/classes');
    router.refresh();
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl">
        <span className="text-sm text-red-600">Xóa &quot;{className}&quot;?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Xóa
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Hủy
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" onClick={() => setShowConfirm(true)}>
      <Trash2 className="w-5 h-5 text-red-500" />
    </Button>
  );
}
