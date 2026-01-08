'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Vui lòng đăng nhập lại');
      setIsLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('classes').insert({
      name,
      description: description || null,
      teacher_id: user.id,
    });

    if (insertError) {
      setError('Không thể tạo lớp học. Vui lòng thử lại.');
      setIsLoading(false);
      return;
    }

    router.push('/teacher/classes');
    router.refresh();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tạo lớp học mới</h1>
          <p className="text-gray-500 mt-1">Điền thông tin để tạo lớp học</p>
        </div>

        {/* Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="name"
                label="Tên lớp học"
                placeholder="VD: Lớp 3A, Nhóm chiều thứ 2..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Mô tả ngắn về lớp học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              <div className="flex justify-end gap-3">
                <Link href="/teacher/classes">
                  <Button type="button" variant="secondary">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" isLoading={isLoading}>
                  Tạo lớp học
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
