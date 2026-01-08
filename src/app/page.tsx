import Link from 'next/link';
import { BookOpen, Mic, Volume2, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">English Learning</span>
          </div>
          <Link
            href="/teacher/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Giáo viên
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Luyện nghe nói tiếng Anh
            <br />
            <span className="text-blue-600">cho bé tiểu học</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Giáo viên tạo bài tập, phụ huynh giúp con luyện tập ở nhà.
            <br />
            Đơn giản, hiệu quả, dễ sử dụng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teacher/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-full hover:bg-blue-700 transition-colors"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/teacher/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-full border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Volume2 className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nghe phát âm chuẩn
            </h3>
            <p className="text-gray-600">
              Giáo viên nhập nội dung, hệ thống tự động tạo audio với giọng đọc tiếng Anh chuẩn
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Mic className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Thu âm giọng nói
            </h3>
            <p className="text-gray-600">
              Học sinh nghe và nói lại, phụ huynh chỉ cần nhấn nút thu âm - đơn giản như chơi
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Giáo viên đánh giá
            </h3>
            <p className="text-gray-600">
              Giáo viên nghe bài làm, chấm điểm và gửi nhận xét để bé tiến bộ mỗi ngày
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Cách sử dụng
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Giáo viên tạo bài tập
                </h3>
                <p className="text-gray-600">
                  Đăng nhập, tạo lớp học và tạo bài tập với các câu tiếng Anh. Hệ thống tự động tạo audio.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Gửi link cho phụ huynh
                </h3>
                <p className="text-gray-600">
                  Sao chép link bài tập và gửi qua Zalo, Facebook... cho phụ huynh. Không cần cài app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Học sinh làm bài
                </h3>
                <p className="text-gray-600">
                  Phụ huynh mở link, giúp con nhập tên, rồi bé nghe và nói lại từng câu. Giao diện to, dễ dùng.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Giáo viên chấm bài
                </h3>
                <p className="text-gray-600">
                  Giáo viên nghe bài thu âm của từng học sinh, chấm điểm và gửi nhận xét để bé cải thiện.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>English Learning Platform - Luyện nghe nói tiếng Anh cho bé</p>
        </div>
      </footer>
    </div>
  );
}
