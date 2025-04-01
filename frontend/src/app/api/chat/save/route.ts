import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Check authentication with authOptions
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No valid session found" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id, hash, title, messages } = await req.json();

    if (!hash || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // First try to find by ID if provided
    let existingChat = null;
    if (id) {
      existingChat = await prisma.chat.findFirst({
        where: {
          id,
          userId,
        },
      });
    }

    // If no chat found by ID, try to find by hash
    if (!existingChat) {
      existingChat = await prisma.chat.findFirst({
        where: {
          userId,
          messages: {
            some: {
              content: {
                contains: `Conversation Hash: ${hash}`,
              },
            },
          },
        },
      });
    }

    if (existingChat) {
      // Update existing chat - delete all previous messages
      await prisma.message.deleteMany({
        where: {
          chatId: existingChat.id,
        },
      });

      // Update chat title
      await prisma.chat.update({
        where: {
          id: existingChat.id,
        },
        data: {
          title,
          updatedAt: new Date(),
        },
      });

      // Add messages back
      for (const message of messages) {
        await prisma.message.create({
          data: {
            chatId: existingChat.id,
            content: message.content,
            role: message.role,
            createdAt: new Date(message.timestamp),
          },
        });
      }

      // Add the hash message
      await prisma.message.create({
        data: {
          chatId: existingChat.id,
          content: `Conversation Hash: ${hash}`,
          role: "system",
          createdAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Chat updated successfully",
        chat: existingChat,
      });
    } else {
      // Create new chat with hash info
      const chat = await prisma.chat.create({
        data: {
          title,
          userId,
          messages: {
            create: [
              // Add a system message with the hash to identify this conversation
              {
                content: `Conversation Hash: ${hash}`,
                role: "system",
              },
              // Add the actual messages
              ...messages.map((msg: any) => ({
                content: msg.content,
                role: msg.role,
                createdAt: new Date(msg.timestamp),
              })),
            ],
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Chat saved successfully",
        chat,
      });
    }
  } catch (error) {
    console.error("Error saving chat:", error);
    return NextResponse.json(
      { error: `Failed to save chat: ${error}` },
      { status: 500 }
    );
  }
}
