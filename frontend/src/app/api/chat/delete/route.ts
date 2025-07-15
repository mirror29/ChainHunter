import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
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

    // Get the chat ID from query parameter
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invalid request data", details: "No chat ID provided" },
        { status: 400 }
      );
    }

    // Find the chat to ensure it belongs to the user
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!chat) {
      return NextResponse.json(
        {
          error: "Chat not found",
          details: "Chat not found or doesn't belong to user",
        },
        { status: 404 }
      );
    }

    // Delete all messages first (due to foreign key constraints)
    await prisma.message.deleteMany({
      where: {
        chatId: id,
      },
    });

    // Delete the chat
    await prisma.chat.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: `Failed to delete chat: ${error}` },
      { status: 500 }
    );
  }
}
