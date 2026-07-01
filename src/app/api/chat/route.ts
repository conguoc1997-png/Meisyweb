export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của công ty Meisy — chuyên về sản xuất và kinh doanh thời trang, quần áo. Bạn hỗ trợ nhân viên và khách hàng giải đáp mọi thắc mắc liên quan đến:

- Quy trình đặt hàng, sản xuất, giao hàng
- Chính sách đổi trả hàng, xử lý sự cố
- Thông tin sản phẩm, chất liệu, size
- Quản lý kho hàng, nguyên phụ liệu
- Kế toán, công nợ, thu chi
- Chấm công, lương nhân viên
- Tư vấn tình huống khó trong công việc

Hãy trả lời bằng tiếng Việt, thân thiện, ngắn gọn và chuyên nghiệp. Nếu không biết câu trả lời chính xác, hãy gợi ý người dùng liên hệ quản lý hoặc phòng ban liên quan.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
    }

    // Validate message format
    const validMessages = messages.filter(
      (m: { role: string; content: string }) =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    );

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-haiku-4-5",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: validMessages,
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const data = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          const errMsg = `data: ${JSON.stringify({ error: String(e) })}\n\n`;
          controller.enqueue(encoder.encode(errMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("POST /api/chat error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
