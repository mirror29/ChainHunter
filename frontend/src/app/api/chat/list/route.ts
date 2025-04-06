import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
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

    // 使用简化的查询，避免复杂的子查询
    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: {
          // 选择所有系统消息（用于提取哈希值）
          where: {
            role: "system",
          },
          select: {
            id: true,
            role: true,
            content: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 提取哈希值并格式化数据
    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        // 从系统消息查找哈希值
        const hashMessage = chat.messages.find((msg) =>
          msg.content.includes("Conversation Hash:")
        );

        let hash = chat.id; // 如果找不到哈希值，则使用聊天ID作为后备

        if (hashMessage) {
          const match = hashMessage.content.match(
            /Conversation Hash: ([\w-]+)/
          );
          if (match && match[1]) {
            hash = match[1];
          }
        }

        // 单独查询每个聊天的最后一条非系统消息
        const lastMessage = await prisma.message.findFirst({
          where: {
            chatId: chat.id,
            role: {
              not: "system",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            content: true,
          },
        });

        const previewText = lastMessage
          ? lastMessage.content.length > 40
            ? lastMessage.content.slice(0, 40) + "..."
            : lastMessage.content
          : "无消息内容";

        return {
          id: chat.id,
          hash,
          title: chat.title || "未命名会话",
          lastMessage: previewText,
          timestamp: chat.updatedAt,
          // 不包含完整的消息内容
        };
      })
    );

    return NextResponse.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("加载聊天列表出错:", error);
    return NextResponse.json(
      { error: `Failed to load chat list: ${error}` },
      { status: 500 }
    );
  }
}
