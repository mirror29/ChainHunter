import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 获取用户使用情况
export async function GET(request: NextRequest) {
  try {
    // 检查身份验证
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyUsage: true,
        maxDailyUsage: true,
        isPremium: true,
        lastUsageDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 计算剩余使用次数
    const remainingUsage = Math.max(0, user.maxDailyUsage - user.dailyUsage);

    return NextResponse.json({
      success: true,
      usage: {
        daily: user.dailyUsage,
        max: user.maxDailyUsage,
        remaining: remainingUsage,
        isPremium: user.isPremium,
        lastUsageDate: user.lastUsageDate,
      },
    });
  } catch (error) {
    console.error("Error getting user usage:", error);
    return NextResponse.json(
      { error: "Error getting user usage information" },
      { status: 500 }
    );
  }
}
