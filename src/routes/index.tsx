import { createFileRoute, Link } from '@tanstack/react-router';
import { 
    PackageSearch, 
    ShieldCheck, 
    Users, 
    Warehouse, 
    BarChart3, 
    ShoppingCart, 
    ArrowRight,
    CheckCircle2,
    Layers
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navbar Minimalist */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Layers className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-800">
                      Sync<span className="text-blue-600">Inventory</span>
                  </span>
              </div>
              <div className="flex items-center gap-4">
                  <Link 
                      to="/login" 
                      className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                      Sign In
                  </Link>
                  <Link 
                      to="/login" 
                      className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hidden sm:block"
                  >
                      Masuk ke Sistem
                  </Link>
              </div>
          </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-6 overflow-hidden relative">
          {/* Background Decorations */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-40 -right-20 w-[600px] h-[600px] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none -z-10" />
          
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-sm font-bold mb-8 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Sistem Tata Kelola Inventaris v2.0
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                  Kendali Penuh Atas <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Rantai Pasok
                  </span> Anda.
              </h1>
              <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Platform manajemen inventaris berbasis cloud yang dirancang khusus untuk mempermudah operasional multi-gudang, pengadaan barang, dan pelacakan stok real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                      to="/login" 
                      className="w-full sm:w-auto px-8 py-4 text-white bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
                  >
                      Mulai Sekarang 
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a 
                      href="#features" 
                      className="w-full sm:w-auto px-8 py-4 text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-lg transition-all"
                  >
                      Pelajari Fitur
                  </a>
              </div>
          </div>
      </main>

      {/* Stats/Logos Bar */}
      <section className="border-y border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
              <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">99.9%</h3>
                  <p className="text-sm font-semibold text-slate-500">Uptime Server</p>
              </div>
              <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">Tak Terbatas</h3>
                  <p className="text-sm font-semibold text-slate-500">Kapasitas SKU</p>
              </div>
              <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">Multi</h3>
                  <p className="text-sm font-semibold text-slate-500">Gudang & Lokasi</p>
              </div>
              <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">Enkripsi</h3>
                  <p className="text-sm font-semibold text-slate-500">Keamanan Data</p>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Fitur Skala Enterprise</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Modul-modul terintegrasi yang dibangun untuk menghilangkan bottleneck pada operasional gudang dan pengadaan Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                    icon: <PackageSearch className="w-6 h-6 text-blue-600" />,
                    title: "Katalog & Varian Cerdas",
                    desc: "Kelola ribuan SKU produk tunggal maupun bervariasi (ukuran, warna). Tetapkan batas minimum stok dan kategori dengan mudah.",
                    color: "bg-blue-50"
                },
                {
                    icon: <ShoppingCart className="w-6 h-6 text-indigo-600" />,
                    title: "Pesanan Pembelian (PO)",
                    desc: "Buat Purchase Order terintegrasi ke Supplier dalam hitungan detik. Lacak status riwayat dari draft hingga barang sampai di gudang.",
                    color: "bg-indigo-50"
                },
                {
                    icon: <Warehouse className="w-6 h-6 text-emerald-600" />,
                    title: "Multi-Gudang Terpusat",
                    desc: "Monitor stok dari berbagai cabang gudang dalam satu layar. Proses penerimaan, pengeluaran, dan penyesuaian stok secara akurat.",
                    color: "bg-emerald-50"
                },
                {
                    icon: <Users className="w-6 h-6 text-amber-600" />,
                    title: "Manajemen Supplier",
                    desc: "Simpan database kontak dan informasi finansial setiap supplier. Evaluasi performa pasokan barang secara historis.",
                    color: "bg-amber-50"
                },
                {
                    icon: <BarChart3 className="w-6 h-6 text-rose-600" />,
                    title: "Laporan & Histori Real-time",
                    desc: "Tiap mutasi barang terekam utuh. Ekspor riwayat logistik ke format PDF/Excel untuk kebutuhan audit dan akuntansi.",
                    color: "bg-rose-50"
                },
                {
                    icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
                    title: "Otorisasi Ketat",
                    desc: "Sistem login berbasis JWT. Data perusahaan Anda terlindungi dibalik lapisan autentikasi server modern.",
                    color: "bg-teal-50"
                }
              ].map((f, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
                      <div className={`w-14 h-14 ${f.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          {f.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* Role Section */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-3xl lg:text-4xl font-black mb-4">Satu Sistem, Dua Peran Spesifik</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">Dirancang optimal baik untuk manajerial yang melihat gambaran besar, maupun staf gudang yang mengeksekusi di lapangan.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                  {/* Admin Role */}
                  <div className="bg-slate-800/50 border border-slate-700 p-10 rounded-3xl relative backdrop-blur-sm hover:bg-slate-800 transition-colors">
                      <div className="absolute top-10 right-10 opacity-10 text-white">
                          <ShieldCheck className="w-32 h-32" />
                      </div>
                      <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm mb-6 border border-blue-500/30">
                          Role: Administrator
                      </div>
                      <h3 className="text-3xl font-black mb-4">Master Control</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed max-w-md">
                          Pegang kendali penuh atas perusahaan. Kelola akses pengguna, setujui PO raksasa, dan atur master data.
                      </p>
                      <ul className="space-y-4">
                          {[
                              'Buka/Tutup Cabang Gudang Baru',
                              'Terbitkan & Edit Pesanan Pembelian',
                              'Manajemen Harga & Katalog Master',
                              'Audit Log Semua Pergerakan Staf',
                              'Registrasi Akun Staf Baru'
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 font-medium text-slate-300">
                                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Staff Role */}
                  <div className="bg-slate-800/50 border border-slate-700 p-10 rounded-3xl relative backdrop-blur-sm hover:bg-slate-800 transition-colors">
                       <div className="absolute top-10 right-10 opacity-10 text-white">
                          <UserCircle className="w-32 h-32" />
                      </div>
                      <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-6 border border-emerald-500/30">
                          Role: Staff Gudang
                      </div>
                      <h3 className="text-3xl font-black mb-4">Eksekusi Lapangan</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed max-w-md">
                          Fokus pada operasional harian di gudang masing-masing tanpa dipusingkan oleh data finansial perusahaan global.
                      </p>
                      <ul className="space-y-4">
                          {[
                              'Penerimaan Barang Fisik (Inbound)',
                              'Pengeluaran Barang (Outbound)',
                              'Stock Opname / Penyesuaian',
                              'Melihat Daftar Produk Gudang',
                              'Terbatas Pada Gudang yang Ditugaskan'
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 font-medium text-slate-300">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white text-center">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Siap Merapikan Gudang Anda?</h2>
              <p className="text-lg text-slate-500 mb-10">Tinggalkan pencatatan manual berbasis kertas. Beralih ke SyncInventory sekarang juga.</p>
              <Link 
                  to="/login" 
                  className="inline-flex px-10 py-5 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(37,99,235,0.6)]"
              >
                  Masuk ke Portal Login
              </Link>
          </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 text-center bg-slate-50">
          <p className="text-sm font-bold text-slate-400">© 2026 SyncInventory System. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Just an extra icon component for the staff section
function UserCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

