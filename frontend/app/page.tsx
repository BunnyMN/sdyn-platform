import Link from 'next/link'
import { ArrowRight, Users, Calendar, FileText, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">СД</span>
              </div>
              <span className="text-xl font-bold text-gray-900">СДЗН</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                Бидний тухай
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900">
                Мэдээ
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900">
                Арга хэмжээ
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Холбоо барих
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Гишүүн болох
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Социал Демократ<br />
              <span className="text-blue-600">Залуучуудын Нэгдэл</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Монголын ирээдүйг бүтээх залуу хүчин. Бид нийгмийн шударга ёс,
              тэгш боломж, хөгжлийн төлөө хамтдаа ажиллана.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
              >
                Гишүүн болох
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="btn-outline text-lg px-8 py-3"
              >
                Дэлгэрэнгүй
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Идэвхтэй гишүүн</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">21</div>
                <div className="text-gray-600">Аймаг, нийслэлд</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-gray-600">Арга хэмжээ/жил</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600">Жилийн түүх</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Гишүүний боломжууд
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Залуучуудын сүлжээ</h3>
                <p className="text-gray-600 text-sm">
                  Улс даяарх залуучуудтай холбогдож, хамтран ажиллах боломж
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Арга хэмжээ, сургалт</h3>
                <p className="text-gray-600 text-sm">
                  Манлайлал, улс төр, нийгмийн сургалтуудад хамрагдах
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Бодлогод оролцох</h3>
                <p className="text-gray-600 text-sm">
                  Залуучуудын бодлого боловсруулалтад дуу хоолойгоо хүргэх
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Хувь хүний хөгжил</h3>
                <p className="text-gray-600 text-sm">
                  Мэдлэг, ур чадвараа дээшлүүлэх, карьер хөгжүүлэх
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Бидэнтэй нэгдээрэй!
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              16-35 насны Монгол залуучууд СДЗН-д гишүүнээр элсэх боломжтой.
              Ирээдүйгээ хамтдаа бүтээцгээе!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-md hover:bg-blue-50 transition-colors"
            >
              Одоо элсэх
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">СД</span>
                </div>
                <span className="text-xl font-bold">СДЗН</span>
              </div>
              <p className="text-gray-400 text-sm">
                Социал Демократ Залуучуудын Нэгдэл
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Холбоосууд</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">Бидний тухай</Link></li>
                <li><Link href="/news" className="hover:text-white">Мэдээ мэдээлэл</Link></li>
                <li><Link href="/events" className="hover:text-white">Арга хэмжээ</Link></li>
                <li><Link href="/documents" className="hover:text-white">Баримт бичиг</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Гишүүдэд</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white">Нэвтрэх</Link></li>
                <li><Link href="/register" className="hover:text-white">Бүртгүүлэх</Link></li>
                <li><Link href="/faq" className="hover:text-white">Түгээмэл асуулт</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Холбоо барих</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Улаанбаатар хот</li>
                <li>info@e-sdy.mn</li>
                <li>+976 XXXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} СДЗН. Бүх эрх хуулиар хамгаалагдсан.
          </div>
        </div>
      </footer>
    </div>
  )
}
