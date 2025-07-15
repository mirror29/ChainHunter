import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

// 设置响应超时和缓存
export const maxDuration = 30; // 增加函数执行时间上限到30秒
export const dynamic = "force-dynamic"; // 确保不会被缓存

export async function GET() {
  // 为每个请求创建独立的Prisma实例
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.POSTGRES_URL_NON_POOLING ||
          process.env.POSTGRES_PRISMA_URL,
      },
    },
  });

  try {
    // 检查身份验证
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      await prisma.$disconnect(); // 断开连接
      return NextResponse.json(
        { error: "Unauthorized", details: "No valid session found" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 简化查询，仅获取必要的数据
    const chats = await prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        // 使用两个单独的查询获取需要的消息，而不是获取所有消息
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50, // 限制返回的聊天总数
    });

    // 收集所有聊天ID
    const chatIds = chats.map((chat) => chat.id);

    // 获取哈希值的系统消息
    const hashMessages = await prisma.message.findMany({
      where: {
        chatId: { in: chatIds },
        role: "system",
        content: { contains: "Conversation Hash:" },
      },
      select: {
        chatId: true,
        content: true,
      },
    });

    // 为每个聊天获取最后一条非系统消息
    const lastMessages = await prisma.message.findMany({
      where: {
        chatId: { in: chatIds },
        role: { not: "system" },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["chatId"],
      select: {
        chatId: true,
        content: true,
      },
    });

    // 索引哈希值和最后消息，以便快速查找
    const hashMessagesByChatId = hashMessages.reduce((acc, msg) => {
      acc[msg.chatId] = msg.content;
      return acc;
    }, {} as Record<string, string>);

    const lastMessagesByChatId = lastMessages.reduce((acc, msg) => {
      acc[msg.chatId] = msg.content;
      return acc;
    }, {} as Record<string, string>);

    // 在内存中处理数据
    const formattedChats = chats.map((chat) => {
      // 查找哈希值
      let hash = chat.id;
      const hashMessageContent = hashMessagesByChatId[chat.id];
      if (hashMessageContent) {
        const match = hashMessageContent.match(/Conversation Hash: ([\w-]+)/);
        if (match && match[1]) {
          hash = match[1];
        }
      }

      // 获取最后一条消息
      const lastMessageContent = lastMessagesByChatId[chat.id] || "无消息内容";
      const previewText =
        lastMessageContent.length > 40
          ? lastMessageContent.slice(0, 40) + "..."
          : lastMessageContent;

      return {
        id: chat.id,
        hash,
        title: chat.title || "未命名会话",
        lastMessage: previewText,
        timestamp: chat.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("加载聊天列表出错:", error);

    // 错误处理
    let errorMessage = "未知错误";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: `Failed to load chat list: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    // 确保释放连接
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("断开连接时出错:", error);
    }
  }
}
