import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MyDataAkuCerita — AI Business Analyst untuk UMKM Indonesia",
  description:
    "Ubah spreadsheet menjadi strategi bisnis dalam 30 detik. AI Business Analyst untuk UMKM Indonesia — insight otomatis, rekomendasi strategis, dan simulasi prediktif dalam Bahasa Indonesia.",
  keywords: ["UMKM", "analisis bisnis", "AI", "data", "Indonesia", "business analyst"],
  openGraph: {
    title: "MyDataAkuCerita — AI Business Analyst untuk UMKM",
    description: "Transforming raw spreadsheets into strategic business narratives in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased text-foreground bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
