import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, summary } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                role: "assistant",
                content: "Maaf, fitur Chat AI memerlukan ANTHROPIC_API_KEY di environment variables untuk berfungsi secara live. Saat ini saya berjalan dalam mode simulasi."
            });
        }

        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                system: `Anda adalah MyDataAkuCerita AI, asisten bisnis cerdas untuk UMKM. 
        Anda telah diberikan data bisnis berikut:
        - Total Revenue: Rp ${summary.totalRevenue.toLocaleString("id-ID")}
        - Total Transaksi: ${summary.totalTransactions}
        - Rata-rata Order: Rp ${summary.avgOrderValue.toLocaleString("id-ID")}
        - Pelanggan Baru: ${summary.newCustomers}
        
        Gunakan data ini untuk menjawab pertanyaan pengguna dengan sangat spesifik, praktis, dan memotivasi. Jawab dalam Bahasa Indonesia yang profesional namun ramah.`,
                messages: messages,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json({
                role: "assistant",
                content: data.content[0].text
            });
        } else {
            throw new Error("Anthropic API error");
        }
    } catch (e) {
        console.error("Chat API error:", e);
        return NextResponse.json(
            { error: "Gagal memproses permintaan chat" },
            { status: 500 }
        );
    }
}
