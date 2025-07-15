import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST() {
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

    // 生成演示信号数据
    const demoSignals = [
      {
        symbol: 'BTCUSDT',
        signalType: 'BUY',
        strength: 0.85,
        price: 98000,
        targetPrice: 102900,
        stopLoss: 95060,
        riskLevel: 'MEDIUM',
        timeframe: '4h',
        analysis: 'RSI(28.5)显示超卖 | MACD显示买入信号 | 价格站上均线，趋势向好 | 成交量increasing，确认信号',
        indicators: {
          rsi: 28.5,
          macd: { macd: 2.5, signal: 1.8, histogram: 0.7 },
          bollinger_bands: { upper: 99500, middle: 97000, lower: 94500 },
          moving_averages: { ma_5: 97500, ma_10: 96800, ma_20: 96200, ma_50: 95000 }
        },
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4小时后过期
      },
      {
        symbol: 'ETHUSDT',
        signalType: 'SELL',
        strength: 0.72,
        price: 3710,
        targetPrice: 3524.5,
        stopLoss: 3821.3,
        riskLevel: 'LOW',
        timeframe: '1h',
        analysis: 'RSI(76.2)显示超买 | 价格触及布林带上轨，可能回调 | MACD显示卖出信号',
        indicators: {
          rsi: 76.2,
          macd: { macd: -1.2, signal: 0.8, histogram: -2.0 },
          bollinger_bands: { upper: 3720, middle: 3650, lower: 3580 },
          moving_averages: { ma_5: 3705, ma_10: 3695, ma_20: 3680, ma_50: 3650 }
        },
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1小时后过期
      },
      {
        symbol: 'BNBUSDT',
        signalType: 'BUY',
        strength: 0.91,
        price: 756,
        targetPrice: 793.8,
        stopLoss: 733.32,
        riskLevel: 'HIGH',
        timeframe: '15m',
        analysis: 'RSI(25.1)显示超卖 | MACD显示买入信号 | 价格触及布林带下轨，可能反弹 | 成交量increasing，确认信号',
        indicators: {
          rsi: 25.1,
          macd: { macd: 3.2, signal: 2.1, histogram: 1.1 },
          bollinger_bands: { upper: 770, middle: 755, lower: 740 },
          moving_averages: { ma_5: 752, ma_10: 750, ma_20: 748, ma_50: 745 }
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15分钟后过期
      }
    ]

    const createdSignals = []
    
    for (const signalData of demoSignals) {
      const signal = await prisma.tradingSignal.create({
        data: signalData
      })
      
      // 为当前用户创建通知
      await prisma.signalNotification.create({
        data: {
          userId: user.id,
          signalId: signal.id,
          method: 'WEBSOCKET'
        }
      })
      
      createdSignals.push(signal)
    }

    return NextResponse.json({
      success: true,
      message: `创建了 ${createdSignals.length} 个演示信号`,
      signals: createdSignals
    })
  } catch (error) {
    console.error('创建演示信号失败:', error)
    return NextResponse.json(
      { error: '创建演示信号失败' },
      { status: 500 }
    )
  }
}