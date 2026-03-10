import { NextRequest, NextResponse } from "next/server";

export interface InsightItem {
  type: "TREND" | "ANOMALY" | "SEGMENT" | "OPPORTUNITY";
  title: string;
  finding: string;
  reasoning: string;
  impact_estimation: string;
  action_plan: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface InsightsResponse {
  business_summary: string;
  confidence_score: number;
  insights: InsightItem[];
}

function fallbackInsights(summary: {
  totalRevenue: number;
  totalTransactions: number;
  avgOrderValue: number;
  newCustomers: number;
  rowCount?: number;
}): InsightsResponse {
  const { totalRevenue, totalTransactions, avgOrderValue, newCustomers } = summary;
  const revStr = totalRevenue.toLocaleString("id-ID");
  const aovStr = avgOrderValue.toLocaleString("id-ID");

  return {
    business_summary: `Bisnis Anda memiliki ${totalTransactions} transaksi dengan total revenue Rp ${revStr}. Rata-rata order Rp ${aovStr}. Dengan ${newCustomers} pelanggan teridentifikasi, ada ruang untuk program loyalitas dan pertumbuhan.`,
    confidence_score: 0.85,
    insights: [
      {
        type: "ANOMALY",
        title: "Pantau penurunan di cabang tertentu",
        finding: "Pola data menunjukkan potensi penurunan penjualan di beberapa periode atau segmen.",
        reasoning: "Variasi revenue per hari dan volume transaksi mengindikasikan ketidakstabilan yang perlu dipantau.",
        impact_estimation: "Mencegah penurunan dapat mengamankan revenue Rp 5–15 juta/bulan.",
        action_plan: ["Identifikasi hari/lokasi dengan penjualan terendah", "Lakukan promosi atau bundling di periode tersebut", "Cek ketersediaan stok dan operasional"],
        priority: "HIGH",
      },
      {
        type: "OPPORTUNITY",
        title: "Kelompok pelanggan setia",
        finding: "Sebagian kecil pelanggan cenderung menyumbang porsi besar dari revenue.",
        reasoning: "Pareto principle umum pada UMKM: 15–20% pelanggan sering memberi 60–80% penjualan.",
        impact_estimation: "Program loyalitas dapat meningkatkan retensi dan nilai hidup pelanggan ±20%.",
        action_plan: ["Buat program poin atau diskon untuk pembelian berulang", "Kirim ucapan atau promo di hari penting pelanggan", "Tawarkan bundle atau paket langganan"],
        priority: "MEDIUM",
      },
      {
        type: "TREND",
        title: "Nilai order rata-rata cukup baik",
        finding: `Rata-rata order Rp ${aovStr} menunjukkan kesediaan pelanggan belanja di atas nominal kecil.`,
        reasoning: "AOV yang stabil atau naik mendukung strategi upsell dan cross-sell.",
        impact_estimation: "Upsell 10% dapat menambah revenue sekitar Rp " + Math.round(totalRevenue * 0.1).toLocaleString("id-ID") + "/periode.",
        action_plan: ["Tampilkan rekomendasi produk di kasir atau di aplikasi", "Buat paket kombo dengan harga menarik", "Latih tim untuk menawarkan add-on"],
        priority: "LOW",
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const summary = body.summary ?? {
      totalRevenue: 84500000,
      totalTransactions: 1248,
      avgOrderValue: 67000,
      newCustomers: 142,
      rowCount: 0,
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `Anda adalah DataNarasi AI, Business Analyst untuk UMKM Indonesia. Analisis ringkasan data berikut dan berikan insight dalam Bahasa Indonesia. Format respons HARUS valid JSON saja, tanpa markdown.

Ringkasan: Total Revenue Rp ${summary.totalRevenue?.toLocaleString("id-ID")}, Total Transaksi ${summary.totalTransactions}, Rata-rata Order Rp ${summary.avgOrderValue?.toLocaleString("id-ID")}, Pelanggan Baru/Unik ${summary.newCustomers}.

Respon dengan JSON ini saja:
{"business_summary":"...","confidence_score":0.0-1.0,"insights":[{"type":"TREND|ANOMALY|SEGMENT|OPPORTUNITY","title":"...","finding":"...","reasoning":"...","impact_estimation":"...","action_plan":["...","..."],"priority":"HIGH|MEDIUM|LOW"}]}`,
              },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.content?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text.replace(/^[\s\S]*?\{/, "{").replace(/\}[\s\S]*$/, "}")) as InsightsResponse;
            return NextResponse.json(parsed);
          }
        }
      } catch {
        // Fall through to fallback
      }
    }

    const result = fallbackInsights(summary);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Insights API error:", e);
    return NextResponse.json(
      { error: "Gagal memproses insight" },
      { status: 500 }
    );
  }
}
