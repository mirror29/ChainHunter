import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
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

    // Get all chats for this user with their messages
    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Extract hash from system messages and transform to the expected format
    const formattedChats = chats.map((chat) => {
      // Find the hash from the system message
      const hashMessage = chat.messages.find(
        (msg) =>
          msg.role === "system" && msg.content.includes("Conversation Hash:")
      );

      let hash = chat.id; // Fallback to chat ID if no hash found

      if (hashMessage) {
        const match = hashMessage.content.match(/Conversation Hash: ([\w-]+)/);
        if (match && match[1]) {
          hash = match[1];
        }
      }

      // Get the last non-system message for the chat preview
      const nonSystemMessages = chat.messages.filter(
        (msg) => msg.role !== "system"
      );
      const lastMessage =
        nonSystemMessages.length > 0
          ? nonSystemMessages[nonSystemMessages.length - 1]
          : null;

      const previewText = lastMessage
        ? lastMessage.content.length > 40
          ? lastMessage.content.slice(0, 40) + "..."
          : lastMessage.content
        : "No messages";

      return {
        id: chat.id,
        hash,
        title: chat.title || "Untitled Chat",
        lastMessage: previewText,
        timestamp: chat.updatedAt,
        messages: chat.messages
          .filter((msg) => !msg.content.includes("Conversation Hash:"))
          .map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
          })),
      };
    });

    return NextResponse.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Error loading chats:", error);
    return NextResponse.json(
      { error: `Failed to load chats: ${error}` },
      { status: 500 }
    );
  }
}
