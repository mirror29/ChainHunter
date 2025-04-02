import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

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

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);

            try {
              // Each chunk is expected to be a JSON object with a "delta" field
              // If the backend sends a different format, adjust accordingly
              const data = JSON.parse(chunk);

              if (data.chatId && !chatIdFromStream) {
                chatIdFromStream = data.chatId;
              }

              if (data.delta) {
                responseText += data.delta;

                // Send the delta to the client
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      delta: data.delta,
                      chatId: chatIdFromStream,
                    })
                  )
                );
              }
            } catch (e) {
              // If the chunk isn't valid JSON, just send it as-is
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Final message with complete response and chatId
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                done: true,
                message: responseText,
                chatId: chatIdFromStream || chatId,
              })
            )
          );
        } catch (error) {
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
