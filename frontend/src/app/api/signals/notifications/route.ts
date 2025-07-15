import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where = {
      userId: user.id,
      ...(unreadOnly ? { readAt: null } : {})
    }

    const notifications = await prisma.signalNotification.findMany({
      where,
      include: {
        signal: {
          select: {
            symbol: true,
            signalType: true,
            strength: true,
            price: true,
            riskLevel: true,
            analysis: true,
            createdAt: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('获取通知失败:', error)
    return NextResponse.json(
      { error: '获取通知失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { signalId, method = 'WEBSOCKET' } = await request.json()

    // 检查信号是否存在
    const signal = await prisma.tradingSignal.findUnique({
      where: { id: signalId }
    })

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // 创建通知记录
    const notification = await prisma.signalNotification.create({
      data: {
        userId: user.id,
        signalId,
        method
      },
      include: {
        signal: true
      }
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('创建通知失败:', error)
    return NextResponse.json(
      { error: '创建通知失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { notificationIds, action } = await request.json()

    if (action === 'markAsRead') {
      await prisma.signalNotification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id
        },
        data: {
          readAt: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('更新通知失败:', error)
    return NextResponse.json(
      { error: '更新通知失败' },
      { status: 500 }
    )
  }
}
