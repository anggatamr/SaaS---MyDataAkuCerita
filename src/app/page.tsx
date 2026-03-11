"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Upload,
  MessageSquare,
  Settings,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  PlayCircle,
  FileText,
  Loader2,
  Menu,
  X,
  Bell,
  PlusCircle,
  Download,
  Moon,
  Sun,
  Sparkles,
  Activity,
  Tag,
  Package,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { parseFile, analyzeData, BusinessData, runSimulation, detectColumns } from "@/lib/data-processor";
import * as XLSX from "xlsx";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquare, label: "Chat AI" },
  { icon: TrendingUp, label: "Simulasi" },
  { icon: FileText, label: "Laporan" },
] as const;

const WIZARD_STEPS = [
  {
    title: "Selamat Datang di MyDataAkuCerita",
    description: "Transformasikan data mentah menjadi narasi bisnis strategis dalam hitungan detik.",
    benefit: "Lihat profit bisnis Anda real-time dan dapatkan rekomendasi cerdas.",
    icon: BarChart3,
  },
  {
    title: "Hubungkan Data Anda",
    description: "Pilih tipe UMKM Anda dan upload file penjualan (.csv atau .xlsx).",
    benefit: "Kami mendukung berbagai format dari Warung, Toko, hingga Restoran.",
    icon: Upload,
  },
  {
    title: "Mapping Otomatis",
    description: "Sistem kami akan mendeteksi kolom Tanggal, Produk, dan Harga secara otomatis.",
    benefit: "Anda tetap bisa menyesuaikan mapping jika diperlukan.",
    icon: Settings,
  },
  {
    title: "Insight Strategis",
    description: "Dapatkan analisis mendalam, tren, dan simulasi keputusan bisnis.",
    benefit: "Mulai optimalkan profit Anda sekarang juga!",
    icon: TrendingUp,
  },
];

function BrandLogo({ showText = true, className = "" }: { showText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0EA5A0] via-[#0EA5A0] to-[#065A82] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(14,165,160,0.4)] relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
        <Activity className="text-white w-5 h-5 absolute z-10 opacity-70" />
        <Sparkles className="text-white w-4 h-4 absolute z-20 -top-0.5 -right-0.5 animate-pulse" />
        <BarChart3 className="text-white w-5 h-5 relative z-0 opacity-40 scale-75" />
      </motion.div>
      {showText && (
        <div className="flex flex-col">
          <div className="text-sm sm:text-base font-black text-foreground tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            MyData<span className="text-primary">AkuCerita</span>
          </div>
          <div className="text-[8px] font-bold text-primary tracking-[0.2em] uppercase mt-1">Data Stories Unfolded</div>
        </div>
      )}
    </div>
  );
}

function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14,165,160,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onNavigate,
  collapsed = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onNavigate}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] mb-1 group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-0
        ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}
      `}
      title={collapsed ? label : undefined}
    >
      {active && (
        <motion.div
          layoutId="flowing-nav-bg"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
        />
      )}
      <span className={`relative z-10 transition-colors ${active ? "text-primary shadow-sm" : "opacity-70 group-hover:opacity-100 group-hover:text-foreground"}`}>{icon}</span>
      {!collapsed && (
        <span className={`relative z-10 flex-1 text-left ${active ? "font-bold text-foreground" : "font-medium"}`}>{label}</span>
      )}
    </motion.button>
  );
}

function StatCard({
  title,
  value,
  trend,
  isNegative = false,
  comparison,
  icon,
  index = 0,
}: {
  title: string;
  value: string;
  trend: string;
  isNegative?: boolean;
  comparison?: string;
  icon?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="apple-card p-6 flex items-center gap-5 transition-all group relative overflow-hidden chroma-grid min-h-[120px]"
    >
      <div className="absolute inset-0 chroma-bg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 shadow-inner shrink-0">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-foreground tracking-tighter mb-1 drop-shadow-sm leading-none">{value}</div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold opacity-80">{title}</div>
        {comparison && (
          <div className={`text-[11px] mt-2 font-bold flex items-center gap-1.5 ${isNegative ? "text-rose-500" : "text-emerald-500"}`}>
            <TrendingUp size={12} className={isNegative ? "rotate-180" : ""} />
            {trend} <span className="text-muted-foreground/50">({comparison})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InsightCard({
  type,
  title,
  content,
  priority,
  onClick,
  index = 0,
}: {
  type: string;
  title: string;
  content: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  onClick?: () => void;
  index?: number;
}) {
  const priorityColors = {
    HIGH: "text-red-500 bg-red-500/10 border-red-500/20",
    MEDIUM: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    LOW: "text-primary bg-primary/10 border-primary/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border border-border p-4 rounded-xl hover:border-primary/40 transition-all cursor-pointer group hover:bg-muted/30 shadow-sm relative overflow-hidden"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${priorityColors[priority]}`}>
          {type}
        </span>
        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>
      <h4 className="font-bold text-foreground text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{content}</p>
    </motion.div>
  );
}

function SimulationSection({ data }: { data: BusinessData }) {
  const [discount, setDiscount] = useState(15);
  const result = runSimulation(data, discount);

  return (
    <div className="bg-card border border-border p-6 md:p-10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-lg">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Simulasi Strategi
          </p>
          <h4 className="text-2xl font-black text-foreground tracking-tight">Eksperimen Diskon</h4>
        </div>
        <div className="space-y-5">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Besaran Diskon (%)</label>
            <span className="text-2xl font-black text-primary">{discount}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <span>Konservatif</span>
            <span>Agresif (50%)</span>
          </div>
        </div>
      </div>
      <div className="bg-muted/30 p-6 rounded-2xl border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <TrendingUp size={100} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-primary w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-foreground shrink-0">Prediksi Dampak</span>
        </div>
        <div className="space-y-5">
          <ImpactItem label="Estimasi Revenue" value={result.estimatedRevenue} color={result.revenueChange >= 0 ? "text-emerald-500" : "text-red-500"} />
          <ImpactItem label="Growth Transaksi" value={`+${result.growthTransactions}`} color="text-emerald-500" />
          <ImpactItem label="Efisiensi Biaya" value={result.efficiency} color={result.efficiency === "Net Positive" ? "text-foreground" : "text-red-500"} />
        </div>
      </div>
    </div>
  );
}

function ImpactItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4 pb-3 border-b border-border/50 last:border-0 last:pb-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className={`text-base font-bold tracking-tight shrink-0 ${color}`}>{value}</span>
    </div>
  );
}

// --- NEW VIEW COMPONENTS ---

function SimulationView({ data }: { data: BusinessData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tighter text-foreground">Simulasi Strategi Bisnis</h2>
        <p className="text-muted-foreground font-medium">Bereksperimen dengan skenario promosi untuk mengoptimalkan profit Anda.</p>
      </div>
      <SimulationSection data={data} />

      {/* Enhanced Simulation Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Optimasi Harga", desc: "Saran penyesuaian harga berdasarkan demand pasar.", icon: <Tag className="w-5 h-5 text-primary" /> },
          { title: "Bundling Produk", desc: "Prediksi item yang laku jika dijual paket bundling.", icon: <Package className="w-5 h-5 text-primary" /> },
          { title: "Efisiensi Stok", desc: "Simulasi pengurangan biaya penyimpanan gudang.", icon: <Truck className="w-5 h-5 text-primary" /> }
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl group hover:border-primary/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ChatAIView({ data }: { data: BusinessData }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Halo! Saya MyDataAkuCerita AI. Saya sudah mempelajari data bisnis Anda. Ada yang bisa saya bantu jelaskan atau analisis lebih lanjut?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          summary: data.summary
        })
      });

      if (!response.ok) throw new Error("Gagal mengambil respon");

      const result = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, terjadi kesalahan saat menghubungi asisten AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-[calc(100vh-160px)] flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="text-primary w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Chat AI Strategis</h3>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Konteks: Data Penjualan Terupload</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
              ? 'bg-primary text-white shadow-lg shadow-primary/20 rounded-tr-none'
              : 'bg-muted text-foreground border border-border rounded-tl-none'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-4 rounded-2xl rounded-tl-none border border-border flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t border-border">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tanyakan sesuatu tentang data Anda..."
            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-16"
          />
          <button
            onClick={sendMessage}
            className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Kirim
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ReportsView({ data }: { data: BusinessData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="bg-card border border-border p-8 rounded-[2rem] shadow-xl relative overflow-hidden print:p-0 print:border-0 print:shadow-none">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
          <FileText size={200} />
        </div>

        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">Laporan Analisis Bisnis</h2>
            <p className="text-muted-foreground font-medium">Periode: {data.charts[0]?.date} - {data.charts[data.charts.length - 1]?.date}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Status Laporan</div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black border border-emerald-500/20 inline-block">FINALIZED</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Ringkasan Eksekutif</h4>
            <div className="space-y-4">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                Berdasarkan data yang dianalisis, bisnis menunjukkan pertumbuhan revenue sebesar <span className="text-primary font-black">12.5%</span> dibandingkan periode sebelumnya. Efisiensi transaksi berada pada level optimis dengan rata-rata order senilai <span className="font-bold">Rp {data.summary.avgOrderValue.toLocaleString("id-ID")}</span>.
              </p>
              <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Total Skor Kesehatan</span>
                  <span className="text-foreground font-black">8.4 / 10</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-500 w-[84%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Insight Strategis Utama</h4>
            <div className="space-y-3">
              {data.insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground mb-0.5">{insight.title}</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ForecastingChart({ data }: { data: BusinessData["forecast"] }) {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white/90">Prediksi 7 Hari Kedepan</h4>
          <p className="text-xs text-slate-500 font-medium">Berdasarkan tren historis & musim</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prediksi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rentang Keyakinan</span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5A0" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0EA5A0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10, fontWeight: 700 }}
              tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`)}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                fontSize: "11px",
                fontWeight: "600",
                color: "var(--foreground)"
              }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="rgba(14,165,160,0.1)"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="rgba(14,165,160,0.1)"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#0EA5A0"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPredicted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<BusinessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showMapping, setShowMapping] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [pendingRows, setPendingRows] = useState<any[] | null>(null);
  const [mappingDateColumn, setMappingDateColumn] = useState<string>("");
  const [mappingRevenueColumn, setMappingRevenueColumn] = useState<string>("");
  const [mappingCandidates, setMappingCandidates] = useState<{ date: string[]; revenue: string[] }>({ date: [], revenue: [] });
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [activeNav, setActiveNav] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<BusinessData["insights"][0] | null>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const uploadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize wizard + theme
  React.useEffect(() => {
    const hasSeenWizard = localStorage.getItem("datanarasi_wizard_seen");
    if (!hasSeenWizard) setShowWizard(true);
    const storedTheme = (localStorage.getItem("datanarasi_theme") as "light" | "dark" | null) ?? null;
    const resolved: "light" | "dark" =
      storedTheme ?? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  const toggleTheme = () => {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("datanarasi_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!uploadRef.current) return;
      const rect = uploadRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGlowPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const downloadTemplate = (type: string) => {
    const a = document.createElement('a');
    const fileMap: Record<string, string> = {
      warung: "/templates/template_warung.csv",
      toko: "/templates/template_toko_kelontong.csv",
      restoran: "/templates/template_restoran.csv",
      online: "/templates/template_online_seller.csv",
    };
    a.href = fileMap[type] ?? "/templates/template_penjualan.csv";
    a.download = a.href.split("/").pop() ?? `template_${type}.csv`;
    a.click();
    showToast(`Template ${type} berhasil diunduh!`, "success");
  };

  const completeWizard = () => {
    localStorage.setItem("datanarasi_wizard_seen", "true");
    setShowWizard(false);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [data]); // Re-attach when data (and thus the container) is ready or changed

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);
      setUploadProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        let parsed: any;
        if (file.name === "demo.csv" || file.size === 0) {
          // Load real demo data instead of empty file
          const demoData = [
            ["Tanggal", "Produk Laku", "Terjual", "Harga Satuan", "Total Penjualan"],
            ["2026-02-01", "Ayam Bakar", "25", "25000", "625000"],
            ["2026-02-01", "Es Jeruk/Teh", "50", "5000", "250000"],
            ["2026-02-01", "Nasi Putih", "40", "5000", "200000"],
            ["2026-02-02", "Bebek Goreng Pak Joss", "30", "35000", "1050000"],
            ["2026-02-02", "Tumis Kangkung", "15", "15000", "225000"],
            ["2026-02-03", "Ayam Bakar", "40", "25000", "1000000"],
            ["2026-02-04", "Bebek Goreng Pak Joss", "20", "35000", "700000"],
            ["2026-02-05", "Es Jeruk/Teh", "60", "5000", "300000"],
            ["2026-02-06", "Tumis Kangkung", "25", "15000", "375000"],
            ["2026-02-07", "Nasi Putih", "60", "5000", "300000"],
          ];
          // Padding to simulate more days
          for (let i = 8; i <= 30; i++) {
            const date = `2026-02-${i.toString().padStart(2, '0')}`;
            demoData.push([date, "Mendoan Panas", Math.floor(Math.random() * 20 + 5).toString(), "10000", (Math.floor(Math.random() * 20 + 5) * 10000).toString()]);
          }
          const headers = demoData[0];
          parsed = demoData.slice(1).map((r) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => {
              obj[h] = r[idx] ?? "";
            });
            return obj;
          });
        } else {
          parsed = await parseFile(file);
        }

        const rows = Array.isArray(parsed) ? parsed : parsed.rows;
        const detected = detectColumns(rows);
        setPendingRows(rows);
        setMappingCandidates({ date: detected.dateCandidates, revenue: detected.revenueCandidates });
        setMappingDateColumn(detected.dateColumn ?? "");
        setMappingRevenueColumn(detected.revenueColumn ?? "");
        setShowMapping(true);
        clearInterval(progressInterval);
        setUploadProgress(100);
        showToast("Mapping kolom terdeteksi. Silakan konfirmasi.", "info");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengolah file.";
        setError(message);
        setPendingRows(null);
        setShowMapping(false);
        showToast("Gagal mengolah file.", "error");
      } finally {
        setIsProcessing(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    []
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const closeSidebar = () => setSidebarOpen(false);

  const confirmMappingAndAnalyze = async () => {
    if (!pendingRows) return;
    setShowMapping(false);
    setIsProcessing(true);
    try {
      const analysis = analyzeData(pendingRows, {
        dateColumn: mappingDateColumn || null,
        revenueColumn: mappingRevenueColumn || null,
      });

      // Optional: enrich with API insights (server will fallback if no key)
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: analysis.summary, charts: analysis.charts }),
        });
        if (res.ok) {
          const api = await res.json();
          if (api.insights?.length) {
            analysis.insights = api.insights.map((i: { title: string; finding: string; action_plan?: string[]; type: string; priority: string }) => ({
              type: i.type as BusinessData["insights"][0]["type"],
              title: i.title,
              content: [i.finding, i.action_plan?.[0]].filter(Boolean).join(" — "),
              priority: i.priority as "HIGH" | "MEDIUM" | "LOW",
            }));
          }
        }
      } catch {
        // ignore
      }

      setData(analysis);
      showToast("Dashboard siap! Insight berhasil dibuat.", "success");
      
      const hasSeenTour = localStorage.getItem("datanarasi_tour_seen");
      if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1500); // Tunda sedikit agar user familiar dulu
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menganalisis data.";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsProcessing(false);
      setPendingRows(null);
    }
  };

  const filterDataByPeriod = (chartData: BusinessData["charts"], selectedPeriod: string) => {
    if (selectedPeriod === "day") return chartData.slice(-1);
    if (selectedPeriod === "week") return chartData.slice(-7);
    if (selectedPeriod === "month") return chartData;
    return chartData;
  };

  const exportToExcel = () => {
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet([
      ["DataNarasi - Laporan Bisnis"],
      [""],
      ["KPI Summary"],
      ["Metrik", "Nilai", "Trend"],
      ["Total Revenue", data.summary.totalRevenue, "+12.5%"],
      ["Total Transaksi", data.summary.totalTransactions, "+4.2%"],
      ["Avg Order Value", data.summary.avgOrderValue, "-1.8%"],
      ["Pelanggan", data.summary.newCustomers, "+8.1%"],
      [""],
      ["Insights"],
      ...data.insights.map((i) => [i.type, i.title, i.content]),
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `DataNarasi-Report-${new Date().toISOString().split("T")[0]}.xlsx`);
    setToast({ message: "Excel berhasil diunduh!", type: "success" });
  };

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <GridBackground />

      {/* Scroll Progress Bar */}
      {data && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
          style={{ scaleX }}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Interactive Nav Card style */}
      <aside
        className={`
          fixed md:sticky md:top-4 md:ml-4 md:rounded-3xl inset-y-0 left-0 
          ${sidebarCollapsed ? "w-[80px]" : "w-[280px] md:w-[260px]"} 
          h-[100dvh] md:h-[calc(100vh-2rem)] nav-card border-r md:border-r-0 md:border md:border-border flex-col z-50
          transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          bg-background/95 md:bg-transparent
        `}
      >
        {/* Logo & Toggle */}
        <div className={`p-5 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && <BrandLogo className="scale-90 origin-left" />}
          {sidebarCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A0] to-[#065A82] flex items-center justify-center shrink-0">
               <Activity className="text-white w-5 h-5 mx-auto" />
            </div>
          )}
          <button 
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                setSidebarOpen(false);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }} 
            className={`text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted/50 hidden md:flex items-center justify-center shrink-0 ${sidebarCollapsed ? 'mt-4' : ''}`}
            title="Toggle Sidebar"
          >
            <MoreHorizontal size={20} className={sidebarCollapsed ? "transition-transform text-primary" : "transition-transform"} />
          </button>
          <button type="button" onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground p-1.5 shrink-0">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar mt-2">
          <div className="relative">
            {!sidebarCollapsed && <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-3">Menu Utama</div>}
            <div className={`space-y-1 ${sidebarCollapsed ? "flex flex-col items-center gap-1" : ""}`}>
              {NAV_ITEMS.map((item, i) => (
                <NavItem
                  key={item.label}
                  icon={<item.icon size={20} />}
                  label={item.label}
                  active={activeNav === i}
                  collapsed={sidebarCollapsed}
                  onNavigate={() => {
                    setActiveNav(i);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* User Badge */}
        <div className="p-4 mt-auto">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} p-2.5 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 shadow-sm backdrop-blur-md transition-all`}>
            <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-primary to-[#065A82] flex items-center justify-center text-sm font-black text-white shadow-lg shrink-0 border border-white/20">A</div>
            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate drop-shadow-sm">Angga</div>
                  <div className="text-[10px] text-primary font-black uppercase tracking-wider">Premium</div>
                </div>
                <Settings size={18} className="text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer shrink-0" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden w-full max-w-[100vw]">
        <header className={`sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 md:px-8 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-border shadow-sm" : "bg-transparent border-transparent"}`}>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1 -ml-1 text-muted-foreground hover:text-foreground md:hidden rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Buka Menu"
            >
               <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
              <BrandLogo showText={false} className="scale-75 origin-left" />
              <ChevronRight size={12} className="text-muted-foreground/30 hidden sm:block" />
              <span className="text-foreground font-bold hidden sm:block">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setWizardStep(0);
                setShowWizard(true);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-xs font-bold"
              title="Buka panduan onboarding"
            >
              <PlusCircle size={16} />
              Panduan
            </button>
            {data && (
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-white/60 dark:hover:text-white/80 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  title="Export PDF"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={exportToExcel}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-white/60 dark:hover:text-white/80 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  title="Export Excel"
                >
                  <Upload size={18} className="rotate-180" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              title={theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
              aria-label="Toggle tema"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
              <Bell size={16} />
            </div>
            {data && (
              <button
                onClick={() => { setData(null); setError(null); }}
                className="px-4 py-1.5 rounded-lg bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-background/50 safe-bottom relative custom-scrollbar"
        >
          {/* Subtle Green Hint Flare */}
          <div className="absolute inset-x-0 top-0 h-64 green-hint opacity-100 transition-opacity duration-1000" aria-hidden="true" />

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`toast ${toast.type}`}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!data ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ type: "spring", damping: 22, stiffness: 120 }}
                className="max-w-3xl mx-auto mt-6 md:mt-12"
              >
                <div className="text-center mb-8 md:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-4 tracking-tighter text-foreground">
                    Cek <span className="underline decoration-primary/40 underline-offset-4">Untung Rugi</span> Bisnis Anda
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg font-medium px-2 max-w-2xl mx-auto leading-relaxed">
                    Upload excel penjualan kasir Anda, biar AI cari tahu makanan/barang apa yang bikin untung dan mana yang macet tanpa perlu hitung manual.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-200 dark:ring-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Data 100% Rahasia & Aman. Kami tidak menjual data Anda.
                  </div>
                </div>

                <div
                  className={`
                    apple-card p-8 sm:p-12 md:p-16 border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden group chroma-grid
                    ${isDragging ? "border-primary bg-primary/[0.02] scale-[1.02] shadow-[0_20px_60px_-15px_rgba(14,165,160,0.2)]" : "border-slate-200 border-dashed dark:border-slate-800 hover:border-primary/50"}
                  `}
                  onDragOver={(e) => {

                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f && /\.(csv|xlsx|xls)$/i.test(f.name)) handleFileUpload(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="sr-only"
                    onChange={onFileChange}
                    ref={fileInputRef}
                    accept=".csv,.xlsx,.xls"
                    aria-label="Pilih file CSV atau Excel"
                  />

                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden />
                      <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white animate-pulse">
                        Menghitung Insight Bisnis...
                      </p>
                      <div className="w-full max-w-xs">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Data Anda diproses secara privat</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="text-primary w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-2 text-foreground text-center">
                        Letakkan File Di Sini
                      </h3>
                      <p className="text-muted-foreground font-medium text-center max-w-sm mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                        Kami mendukung CSV dan Excel. Data Anda aman dan diproses secara privat.
                      </p>
                      <div
                        className="w-full max-w-md mx-auto mb-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                          Pilih tipe UMKM
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedBusinessType}
                            onChange={(e) => setSelectedBusinessType(e.target.value)}
                            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Pilih (opsional)</option>
                            <option value="warung">Warung</option>
                            <option value="toko">Toko Kelontong</option>
                            <option value="restoran">Restoran</option>
                            <option value="online">Online Seller</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => downloadTemplate(selectedBusinessType || "warung")}
                            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center gap-2"
                            title="Download template sesuai tipe UMKM"
                          >
                            <Download size={16} />
                            Template
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Tip: download template lalu isi, kemudian upload kembali.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                        <button
                          type="button"
                          className="w-full sm:w-auto px-8 py-3 bg-foreground text-background rounded-full font-bold shadow-xl shadow-foreground/10 hover:shadow-2xl hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 group/btn min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Pilih File <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileUpload(new File([], "demo.csv"));
                          }}
                          className="w-full sm:w-auto px-8 py-3 bg-background text-foreground border-2 border-border rounded-full font-bold hover:bg-muted transition-all flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2"
                        >
                          Coba Demo Mode
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="pb-8 md:pb-12"
              >
                <AnimatePresence mode="wait">
                  {activeNav === 0 && (
                    <motion.div
                      key="dashboard-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 md:space-y-8"
                    >
                      {/* Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="grid stat-cards gap-3 md:gap-6"
                      >
                        {isProcessing ? (
                          // Skeleton loaders
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="apple-card p-4 md:p-6 bg-card border-none shadow-sm">
                              <div className="skeleton h-4 w-20 mb-2 rounded" />
                              <div className="skeleton h-8 w-24 mb-1 rounded" />
                              <div className="skeleton h-3 w-12 rounded" />
                            </div>
                          ))
                        ) : (
                          <>
                            <StatCard
                              index={0}
                              title="Total Revenue"
                              value={`Rp ${data.summary.totalRevenue.toLocaleString("id-ID")}`}
                              trend="+12.5%"
                              comparison="+Rp 1.2M"
                              icon="💰"
                            />
                            <StatCard
                              index={1}
                              title="Total Transaksi"
                              value={data.summary.totalTransactions.toLocaleString("id-ID")}
                              trend="+4.2%"
                              comparison="+12"
                              icon="📈"
                            />
                            <StatCard
                              index={2}
                              title="Avg Order Value"
                              value={`Rp ${data.summary.avgOrderValue.toLocaleString("id-ID")}`}
                              trend="-1.8%"
                              isNegative
                              comparison="-Rp 5rb"
                              icon="📦"
                            />
                            <StatCard
                              index={3}
                              title="Pelanggan Baru"
                              value={data.summary.newCustomers.toLocaleString("id-ID")}
                              trend="+8.1%"
                              comparison="+4"
                              icon="🎯"
                            />
                          </>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                      >
                        {/* AI Insights */}
                        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              AI Strategi <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {data.insights.map((insight, idx) => (
                              <InsightCard key={idx} {...insight} index={idx} onClick={() => setSelectedInsight(insight)} />
                            ))}
                          </div>
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Trend Penjualan</h3>
                            <div className="flex gap-1.5 bg-muted/30 p-1 rounded-lg border border-border">
                              {(["day", "week", "month"] as const).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => setPeriod(p)}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${period === p
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                  {p === "day" ? "Harian" : p === "week" ? "Mingguan" : "Bulanan"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col h-[400px]">
                            <div className="flex-1 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={filterDataByPeriod(data.charts, period)}
                                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                                  <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`)}
                                    width={50}
                                  />
                                  <Tooltip
                                    cursor={{ fill: "rgba(14,165,160,0.05)" }}
                                    contentStyle={{
                                      background: "var(--card)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "12px",
                                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "var(--foreground)"
                                    }}
                                    itemStyle={{ color: "#0EA5A0" }}
                                  />
                                  <Bar
                                    dataKey="revenue"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary/80 hover:fill-primary transition-colors"
                                  >
                                    {filterDataByPeriod(data.charts, period).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fillOpacity={0.8} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Forecasting Chart */}
                          <ForecastingChart data={data.forecast} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeNav === 1 && <ChatAIView key="chat-view" data={data} />}
                  {activeNav === 2 && <SimulationView key="simulation-view" data={data} />}
                  {activeNav === 3 && <ReportsView key="reports-view" data={data} />}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Data Mapping Modal */}
      <AnimatePresence>
        {showMapping && pendingRows && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowMapping(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-3xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                    Mapping Kolom Data
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Konfirmasi kolom yang mewakili <b>Tanggal</b> and <b>Total/Revenue</b>. Anda bisa ubah jika deteksi kurang tepat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapping(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
                  aria-label="Tutup mapping"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Kolom Tanggal
                    </label>
                    <select
                      value={mappingDateColumn}
                      onChange={(e) => setMappingDateColumn(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="">(Tidak ada / abaikan)</option>
                      {mappingCandidates.date.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Kolom Total / Revenue
                    </label>
                    <select
                      value={mappingRevenueColumn}
                      onChange={(e) => setMappingRevenueColumn(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="">(Tidak terdeteksi)</option>
                      {mappingCandidates.revenue.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tip: pilih kolom yang nilainya paling dekat dengan total transaksi (mis. <code>Total</code>, <code>Pendapatan</code>, <code>Revenue</code>).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Preview 5 baris data
                    </p>
                    <span className="text-xs font-bold text-slate-400">
                      {pendingRows.length.toLocaleString("id-ID")} baris
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-auto max-h-[260px] bg-white dark:bg-slate-950">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                          <tr>
                            {Object.keys((pendingRows[0] ?? {}) as Record<string, unknown>).slice(0, 6).map((k) => (
                              <th key={k} className="text-left px-3 py-2 font-black text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-t border-slate-200/60 dark:border-slate-800/60">
                              {Object.keys((pendingRows[0] ?? {}) as Record<string, unknown>).slice(0, 6).map((k) => (
                                <td key={k} className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                  {String((row as any)?.[k] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowMapping(false)}
                  className="px-5 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={confirmMappingAndAnalyze}
                  className="px-6 py-3 rounded-2xl font-black bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.99]"
                >
                  Lanjutkan ke Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Wizard Portal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-border"
            >
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={completeWizard}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={wizardStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8">
                      {React.createElement(WIZARD_STEPS[wizardStep].icon, {
                        className: "text-primary w-10 h-10",
                      })}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 tracking-tighter">
                      {WIZARD_STEPS[wizardStep].title}
                    </h2>
                    <p className="text-muted-foreground font-medium mb-2 leading-relaxed">
                      {WIZARD_STEPS[wizardStep].description}
                    </p>
                    <p className="text-sm text-primary font-bold bg-primary/5 px-4 py-2 rounded-full">
                      {WIZARD_STEPS[wizardStep].benefit}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-12 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (wizardStep < WIZARD_STEPS.length - 1) {
                        setWizardStep(wizardStep + 1);
                      } else {
                        completeWizard();
                      }
                    }}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                  >
                    {wizardStep === WIZARD_STEPS.length - 1 ? "Mulai Sekarang" : "Lanjutkan"}
                    <ChevronRight size={20} />
                  </button>
                  {wizardStep === 0 && (
                    <button
                      onClick={completeWizard}
                      className="w-full py-3 text-muted-foreground/60 font-bold hover:text-foreground transition-colors"
                    >
                      Lewati Panduan
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-[2.5rem] max-w-lg w-full p-8 md:p-12 shadow-2xl relative overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-8">
                <span
                  className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${selectedInsight.priority === "HIGH"
                    ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20"
                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20"
                    }`}
                >
                  {selectedInsight.type}
                </span>
                <h2 className="text-2xl md:text-3xl font-black mt-4 text-slate-900 dark:text-white tracking-tighter">
                  {selectedInsight.title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                {selectedInsight.content}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Halo, ini rekomendasi strategi dari MyDataAkuCerita:\n\n*${selectedInsight.title}*\n${selectedInsight.content}\n\nAyo segera kita eksekusi!`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="flex-1 px-6 py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#128C7E] transition-all shadow-xl shadow-[#25D366]/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  Kirim ke Tim (WhatsApp)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedInsight.title}\n${selectedInsight.content}`);
                    setToast({ message: "Teks insight disalin!", type: "success" });
                  }}
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Salin Teks
                </button>
              </div>
              <div className="mt-3 text-center">
                <button onClick={() => setSelectedInsight(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Tour Modal */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative border border-border p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {tourStep === 0 && <LayoutDashboard className="text-primary w-8 h-8" />}
                {tourStep === 1 && <BarChart3 className="text-primary w-8 h-8" />}
                {tourStep === 2 && <MessageSquare className="text-primary w-8 h-8" />}
              </div>
              
              <h3 className="text-2xl font-black mb-3">
                {tourStep === 0 ? "Selamat Datang!" : tourStep === 1 ? "Cek Insight AI" : "Tanya Asisten AI"}
              </h3>
              
              <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                {tourStep === 0 
                  ? "Dashboard ini menampilkan rangkuman penjualan Anda. Cek total pemasukan dan status pelanggan di deretan kartu atas." 
                  : tourStep === 1 
                  ? "Sistem AI kami telah membaca pola data Anda dan memberikan rekomendasi strategi spesifik di bagian AI Strategi." 
                  : "Punya pertanyaan soal data jualan? Tanyakan langsung ke Chat AI menggunakan bahasa sehari-hari."}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${tourStep === i ? "bg-primary w-4" : "bg-primary/20"} transition-all`} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (tourStep < 2) {
                      setTourStep(tourStep + 1);
                    } else {
                      localStorage.setItem("datanarasi_tour_seen", "true");
                      setShowTour(false);
                    }
                  }}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  {tourStep < 2 ? "Lanjut" : "Mulai Gunakan"}
                </button>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem("datanarasi_tour_seen", "true");
                  setShowTour(false);
                }} 
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation — Bottom Bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border md:hidden flex items-center justify-around px-2 z-50">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              if (item.label === "Dashboard") setData(null);
              setSidebarOpen(false);
            }}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-primary transition-colors"
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
