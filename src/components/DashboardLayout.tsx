'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Home, Users, ClipboardList, LogOut, GraduationCap } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/teacher', label: 'Trang chủ', icon: Home },
  { href: '/teacher/classes', label: 'Lớp học', icon: Users },
  { href: '/teacher/lessons', label: 'Bài học', icon: GraduationCap },
  { href: '/teacher/assignments', label: 'Giao bài', icon: ClipboardList },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/teacher/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
          <span className="font-bold text-gray-900">English Learning</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/teacher' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
