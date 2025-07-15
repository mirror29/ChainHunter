'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Database, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface DatabaseStatus {
  status: 'healthy' | 'error'
  timestamp: string
  responseTime?: string
  statistics?: {
    users: number
    chats: number
    messages: number
    signals: number
    notifications: number
  }
  activity?: {
    lastUserActivity: string | null
    lastChatActivity: string | null
    idleHours: number | null
    riskLevel: 'low' | 'medium' | 'high' | 'unknown'
  }
  recommendations?: {
    shouldKeepAlive: boolean
    nextKeepAlive: string
  }
  isPaused?: boolean
  error?: string
}

interface DatabaseStatusProps {
  className?: string
  showDetails?: boolean
}

export function DatabaseStatus({ className, showDetails = false }: DatabaseStatusProps) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
    
    if (autoRefresh) {
      const interval = setInterval(checkDatabaseStatus, 5 * 60 * 1000) // 每5分钟检查一次
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/status')
      const data = await response.json()
      setStatus(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error('检查数据库状态失败:', error)
      setStatus({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: '无法连接到数据库状态API',
        isPaused: true
      })
    } finally {
      setLoading(false)
    }
  }

  const executeKeepAlive = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/keepalive', { method: 'POST' })
      
      if (response.ok) {
        // 保活成功后重新检查状态
        setTimeout(checkDatabaseStatus, 1000)
      }
    } catch (error) {
      console.error('执行数据库保活失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Database className="h-4 w-4 animate-pulse" />
    if (!status) return <Database className="h-4 w-4 text-gray-400" />
    
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return status.isPaused ? <WifiOff className="h-4 w-4 text-red-500" /> : <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Database className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'error':
        return status.isPaused ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatIdleTime = (hours: number | null) => {
    if (!hours) return '未知'
    if (hours < 1) return '不到1小时'
    if (hours < 24) return `${hours}小时`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`
  }

  if (!showDetails) {
    // 简化视图，只显示状态图标
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-gray-600">
          {status?.status === 'healthy' ? '数据库正常' : '数据库异常'}
        </span>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            数据库状态
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkDatabaseStatus}
              disabled={loading}
            >
              刷新
            </Button>
            {status?.status === 'error' && (
              <Button
                variant="outline"
                size="sm"
                onClick={executeKeepAlive}
                disabled={loading}
              >
                激活数据库
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status && (
          <>
            {/* 基本状态信息 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">连接状态:</span>
              <Badge className={getStatusColor()}>
                {status.status === 'healthy' ? '正常' : status.isPaused ? '数据库暂停' : '连接异常'}
              </Badge>
            </div>

            {status.responseTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">响应时间:</span>
                <span className="text-sm font-medium">{status.responseTime}</span>
              </div>
            )}

            {lastChecked && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">最后检查:</span>
                <span className="text-sm">{lastChecked.toLocaleString()}</span>
              </div>
            )}

            {/* 数据库统计 */}
            {status.statistics && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">数据统计</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>用户: {status.statistics.users}</div>
                  <div>聊天: {status.statistics.chats}</div>
                  <div>消息: {status.statistics.messages}</div>
                  <div>信号: {status.statistics.signals}</div>
                </div>
              </div>
            )}

            {/* 活动信息 */}
            {status.activity && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">活动状态</h4>
                
                {status.activity.idleHours !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">空闲时间:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{formatIdleTime(status.activity.idleHours)}</span>
                      <Badge className={getRiskLevelColor(status.activity.riskLevel)}>
                        {status.activity.riskLevel === 'high' ? '高风险' : 
                         status.activity.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* 风险指示器 */}
                {status.activity.idleHours !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>暂停风险</span>
                      <span>{Math.min(100, Math.floor((status.activity.idleHours / 168) * 100))}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.floor((status.activity.idleHours / 168) * 100))} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      7天无活动后数据库将暂停
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 建议 */}
            {status.recommendations && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">建议</h4>
                <div className="text-sm text-gray-600">
                  {status.recommendations.shouldKeepAlive ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="h-4 w-4" />
                      建议启用自动保活机制
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      数据库活跃度良好
                    </div>
                  )}
                </div>
                {status.recommendations.nextKeepAlive && (
                  <div className="text-xs text-gray-500">
                    下次保活: {new Date(status.recommendations.nextKeepAlive).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* 错误信息 */}
            {status.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  错误信息
                </div>
                <div className="text-sm text-red-600 mt-1">{status.error}</div>
                {status.isPaused && (
                  <div className="text-xs text-red-500 mt-2">
                    数据库可能已暂停，请检查Supabase控制台或点击&quot;激活数据库&quot;按钮
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!status && !loading && (
          <div className="text-center text-gray-500 py-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">点击刷新检查数据库状态</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}