import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // 执行一个轻量级的数据库查询来保持连接活跃
    const result = await prisma.$queryRaw`SELECT 1 as ping`
    
    const endTime = Date.now()
    const responseTime = endTime - startTime

    // 获取数据库连接池状态（如果可用）
    let connectionInfo = {}
    try {
      // 尝试获取一些基本的数据库统计信息
      const userCount = await prisma.user.count()
      const chatCount = await prisma.chat.count()
      
      connectionInfo = {
        userCount,
        chatCount,
        tablesAccessed: ['User', 'Chat']
      }
    } catch (error) {
      console.warn('无法获取数据库统计信息:', error)
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database is alive and responsive',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      connectionInfo,
      ping: result
    })
  } catch (error) {
    console.error('数据库保活检查失败:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // 执行更复杂的操作来确保数据库完全激活
    const operations = []
    
    // 1. 基本连接测试
    operations.push(prisma.$queryRaw`SELECT current_timestamp as server_time`)
    
    // 2. 检查主要表的存在性
    operations.push(prisma.user.findFirst({ select: { id: true } }))
    operations.push(prisma.chat.findFirst({ select: { id: true } }))
    
    // 3. 如果交易信号表存在，也检查它
    try {
      operations.push(prisma.tradingSignal.findFirst({ select: { id: true } }))
    } catch (error) {
      // 如果交易信号表不存在，忽略错误
      console.log('交易信号表可能还未创建')
    }

    const results = await Promise.allSettled(operations)
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const totalOperations = results.length
    
    return NextResponse.json({
      status: 'success',
      message: 'Database warmup completed',
      timestamp: new Date().toISOString(),
      operationsCompleted: `${successCount}/${totalOperations}`,
      details: results.map((result, index) => ({
        operation: index + 1,
        status: result.status,
        ...(result.status === 'rejected' && { error: result.reason?.message })
      }))
    })
  } catch (error) {
    console.error('数据库预热失败:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database warmup failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}