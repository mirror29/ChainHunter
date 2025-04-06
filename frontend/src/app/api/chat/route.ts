import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, chatId, chatHash } = body;

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Call the Python backend API with streaming support
    const apiResponse = await fetch(
      `${process.env.PYTHON_API_URL || "http://localhost:8000"}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userId: session.user.id,
          chatId,
          chatHash,
          stream: true, // Request streaming response
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Error from backend" },
        { status: apiResponse.status }
      );
    }

    // Return a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Read the response as a stream of data
          const reader = apiResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let responseText = "";
          let chatIdFromStream = null;
          let finalMessageSent = false;

          console.log("前端API开始处理流式响应");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            console.log("前端API收到数据块:", chunk);

            // 检查数据块是否包含done标志，如果包含则标记已发送完成消息
            if (
              chunk.includes('"done":true') ||
              chunk.includes('"done": true')
            ) {
              console.log("检测到后端已发送done消息");
              finalMessageSent = true;
            }

            // 直接将原始数据块传递给客户端
            controller.enqueue(encoder.encode(chunk));
          }

          // 仅在后端未发送完成消息时添加一个完成消息
          if (!finalMessageSent) {
            console.log("后端未发送完成消息，添加额外的完成消息");
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  done: true,
                  message: responseText,
                  chatId: chatIdFromStream || chatId,
                }) + "\n"
              )
            );
          }
        } catch (error) {
          console.error("流处理错误:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Error processing chat message" },
      { status: 500 }
    );
  }
}
