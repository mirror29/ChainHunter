import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // 检查数据库连接状态
    const connectionTest = await prisma.$queryRaw`SELECT version() as db_version, current_timestamp as current_time`
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // 获取数据库统计信息
    const stats = await Promise.allSettled([
      prisma.user.count(),
      prisma.chat.count(),
      prisma.message.count(),
      // 如果存在交易信号表，也获取其统计 (使用try-catch处理表不存在的情况)
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "TradingSignal"`.catch(() => ({ count: 0 })),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "SignalNotification"`.catch(() => ({ count: 0 }))
    ])
    
    const [userCount, chatCount, messageCount, signalCountResult, notificationCountResult] = stats.map(
      result => result.status === 'fulfilled' ? result.value : 0
    )
    
    // 处理原始查询结果
    const signalCount = signalCountResult && Array.isArray(signalCountResult) && signalCountResult[0] 
      ? Number(signalCountResult[0].count) : 0
    const notificationCount = notificationCountResult && Array.isArray(notificationCountResult) && notificationCountResult[0]
      ? Number(notificationCountResult[0].count) : 0

    // 检查最近的活动
    const recentActivity = await Promise.allSettled([
      prisma.user.findFirst({
        orderBy: { dailyUsage: 'desc' },
        select: { id: true, lastUsageDate: true }
      }),
      prisma.chat.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, updatedAt: true }
      })
    ])

    const lastUserActivity = recentActivity[0].status === 'fulfilled' ? recentActivity[0].value?.lastUsageDate : null
    const lastChatActivity = recentActivity[1].status === 'fulfilled' ? recentActivity[1].value?.updatedAt : null

    // 计算数据库空闲时间
    const now = new Date()
    const lastActivity = [lastUserActivity, lastChatActivity]
      .filter(Boolean)
      .map(date => new Date(date!))
      .sort((a, b) => b.getTime() - a.getTime())[0]

    const idleHours = lastActivity 
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60))
      : null

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      connectionTest,
      statistics: {
        users: userCount,
        chats: chatCount,
        messages: messageCount,
        signals: signalCount,
        notifications: notificationCount
      },
      activity: {
        lastUserActivity,
        lastChatActivity,
        idleHours,
        riskLevel: idleHours ? (
          idleHours > 120 ? 'high' : // 5天
          idleHours > 72 ? 'medium' : // 3天
          'low'
        ) : 'unknown'
      },
      recommendations: {
        shouldKeepAlive: idleHours ? idleHours > 48 : true, // 2天后开始保活
        nextKeepAlive: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString() // 6小时后
      }
    })
  } catch (error) {
    console.error('数据库状态检查失败:', error)
    
    // 如果数据库连接失败，可能是暂停状态
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      isPaused: error instanceof Error && (
        error.message.includes('database is paused') ||
        error.message.includes('connection refused') ||
        error.message.includes('timeout')
      ),
      action: 'Database may be paused. Please check Supabase dashboard.'
    }, { status: 503 })
  }
}