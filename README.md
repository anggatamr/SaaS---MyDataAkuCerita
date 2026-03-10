# ✨ MyDataAkuCerita

> **Transformasikan data mentah menjadi narasi bisnis strategis dalam hitungan detik.**

MyDataAkuCerita adalah platform analytics cerdas yang dirancang khusus untuk UMKM Indonesia. Dengan pendekatan "Data Storytelling", platform ini membantu pemilik bisnis memahami angka di balik penjualan mereka melalui visualisasi yang memukau dan wawasan berbasis AI.

---

## 🚀 Fitur Utama

- **📊 Dashboard Interaktif**: Visualisasi revenue, transaksi, dan performa pelanggan dengan estetika premium.
- **🤖 AI Business Insights**: Analisis otomatis menggunakan AI untuk menemukan tren, anomali, dan peluang bisnis (Powered by Anthropic Claude).
- **📉 Simulasi Strategi**: Bereksperimen dengan diskon dan promosi untuk melihat prediksi dampak pada profit sebelum eksekusi.
- **📅 Forecasting Penjualan**: Prediksi performa bisnis untuk 7 hari ke depan berdasarkan data historis.
- **🌗 Unified Theme Engine**: Pengalaman pengguna yang mulus dalam tema Terang (Light) maupun Gelap (Dark).
- **📱 Responsive Design**: Akses analytics Anda kapan saja, di mana saja, melalui perangkat mobile atau desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI**: Anthropic Claude API
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Memulai (Getting Started)

1. **Clone project**:
   ```bash
   git clone <url-repo-anda>
   cd datanarasi
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Buat file `.env.local` dan tambahkan:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📦 Deployment

Project ini siap untuk di-deploy ke **Vercel**:

1. Push kode Anda ke GitHub.
2. Hubungkan repository ke dashboard Vercel.
3. Pastikan untuk menambahkan `ANTHROPIC_API_KEY` di bagian Environment Variables jika ingin mengaktifkan fitur AI Live.

---

Dibuat dengan ❤️ untuk kemajuan UMKM Indonesia.
