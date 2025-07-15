import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { signalPreference: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 如果用户没有设置偏好，返回默认值
    const preferences = user.signalPreference || {
      symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      signalTypes: ['BUY', 'SELL'],
      riskLevels: ['LOW', 'MEDIUM'],
      timeframes: ['1h', '4h'],
      pushEnabled: true,
      minStrength: 0.6,
      maxDaily: 50
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('获取信号偏好失败:', error)
    return NextResponse.json(
      { error: '获取信号偏好失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    
    const preferences = await prisma.userSignalPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        symbols: body.symbols || [],
        signalTypes: body.signalTypes || [],
        riskLevels: body.riskLevels || [],
        timeframes: body.timeframes || [],
        pushEnabled: body.pushEnabled ?? true,
        minStrength: body.minStrength ?? 0.6,
        maxDaily: body.maxDaily ?? 50
      },
      update: {
        symbols: body.symbols,
        signalTypes: body.signalTypes,
        riskLevels: body.riskLevels,
        timeframes: body.timeframes,
        pushEnabled: body.pushEnabled,
        minStrength: body.minStrength,
        maxDaily: body.maxDaily
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('更新信号偏好失败:', error)
    return NextResponse.json(
      { error: '更新信号偏好失败' },
      { status: 500 }
    )
  }
}