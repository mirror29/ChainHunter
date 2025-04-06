import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // 检查身份验证
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No valid session found" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取聊天ID参数
    const chatId = request.nextUrl.searchParams.get("id");

    if (!chatId) {
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 });
    }

    // 获取指定聊天会话及其完整消息内容
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId, // 确保只能获取自己的聊天
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // 从系统消息提取哈希值
    const hashMessage = chat.messages.find(
      (msg) =>
        msg.role === "system" && msg.content.includes("Conversation Hash:")
    );

    let hash = chat.id; // 如果找不到哈希值，则使用聊天ID作为后备

    if (hashMessage) {
      const match = hashMessage.content.match(/Conversation Hash: ([\w-]+)/);
      if (match && match[1]) {
        hash = match[1];
      }
    }

    // 格式化聊天数据
    const formattedChat = {
      id: chat.id,
      hash,
      title: chat.title || "未命名会话",
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

    return NextResponse.json({
      success: true,
      chat: formattedChat,
    });
  } catch (error) {
    console.error("加载聊天详情出错:", error);
    return NextResponse.json(
      { error: `Failed to load chat details: ${error}` },
      { status: 500 }
    );
  }
}
