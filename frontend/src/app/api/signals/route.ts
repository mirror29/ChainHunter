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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const symbol = searchParams.get('symbol')
    const signalType = searchParams.get('signalType')
    const riskLevel = searchParams.get('riskLevel')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (symbol) {
      where.symbol = symbol
    }
    
    if (signalType) {
      where.signalType = signalType
    }
    
    if (riskLevel) {
      where.riskLevel = riskLevel
    }

    const [signals, total] = await Promise.all([
      prisma.tradingSignal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          notifications: {
            where: { userId: session.user.id },
            select: { readAt: true }
          }
        }
      }),
      prisma.tradingSignal.count({ where })
    ])

    return NextResponse.json({
      signals: signals.map(signal => ({
        ...signal,
        isRead: signal.notifications.length > 0 && signal.notifications[0].readAt !== null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取交易信号失败:', error)
    return NextResponse.json(
      { error: '获取交易信号失败' },
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

    const body = await request.json()
    
    // 手动创建交易信号（管理员功能或测试用）
    const signal = await prisma.tradingSignal.create({
      data: {
        symbol: body.symbol,
        signalType: body.signalType,
        strength: body.strength,
        price: body.price,
        targetPrice: body.targetPrice,
        stopLoss: body.stopLoss,
        riskLevel: body.riskLevel,
        timeframe: body.timeframe,
        indicators: body.indicators || {},
        analysis: body.analysis,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
      }
    })

    return NextResponse.json(signal, { status: 201 })
  } catch (error) {
    console.error('创建交易信号失败:', error)
    return NextResponse.json(
      { error: '创建交易信号失败' },
      { status: 500 }
    )
  }
}