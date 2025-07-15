import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // 测试基本连接
    console.log('测试数据库连接...')
    
    // 执行简单查询测试连接
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('数据库连接测试结果:', result)
    
    // 测试基本表查询
    const userCount = await prisma.user.count()
    console.log('用户表查询成功，用户数:', userCount)
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection test successful',
      tests: {
        connection: true,
        userTable: true,
        userCount
      }
    })
  } catch (error) {
    console.error('数据库测试失败:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}