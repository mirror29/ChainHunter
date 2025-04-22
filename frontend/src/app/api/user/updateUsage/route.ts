import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 更新用户使用次数
export async function POST(request: NextRequest) {
  try {
    // 检查身份验证
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 检查是否需要重置使用次数（新的一天）
    const now = new Date();
    const lastUsage = user.lastUsageDate;
    let shouldReset = false;

    if (!lastUsage) {
      shouldReset = true;
    } else {
      // 比较日期是否为同一天
      const lastDate = new Date(lastUsage);
      shouldReset =
        lastDate.getFullYear() !== now.getFullYear() ||
        lastDate.getMonth() !== now.getMonth() ||
        lastDate.getDate() !== now.getDate();
    }

    // 如果是新的一天或第一次使用，重置使用次数
    if (shouldReset) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsage: 1, // 首次使用计为1
          lastUsageDate: now,
        },
      });

      return NextResponse.json({
        success: true,
        usage: {
          daily: 1,
          max: user.maxDailyUsage,
          remaining: user.maxDailyUsage - 1,
          isPremium: user.isPremium,
        },
        reset: true,
      });
    }
    // 检查是否超出限制
    else if (user.dailyUsage >= user.maxDailyUsage) {
      return NextResponse.json({
        success: false,
        error: "Usage limit exceeded",
        usage: {
          daily: user.dailyUsage,
          max: user.maxDailyUsage,
          remaining: 0,
          isPremium: user.isPremium,
        },
        limitExceeded: true,
      }, { status: 429 });
    }
    // 增加使用次数
    else {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsage: {
            increment: 1,
          },
          lastUsageDate: now,
        },
      });

      return NextResponse.json({
        success: true,
        usage: {
          daily: updatedUser.dailyUsage,
          max: updatedUser.maxDailyUsage,
          remaining: updatedUser.maxDailyUsage - updatedUser.dailyUsage,
          isPremium: updatedUser.isPremium,
        },
      });
    }
  } catch (error) {
    console.error("Error updating user usage:", error);
    return NextResponse.json(
      { error: "Error updating user usage" },
      { status: 500 }
    );
  }
}
