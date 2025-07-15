'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, Activity, Clock, Database } from 'lucide-react'

interface KeepAliveServiceProps {
  className?: string
}

export function KeepAliveService({ className }: KeepAliveServiceProps) {
  const [isActive, setIsActive] = useState(false)
  const [interval, setInterval] = useState(6) // 6小时间隔
  const [lastPing, setLastPing] = useState<Date | null>(null)
  const [nextPing, setNextPing] = useState<Date | null>(null)
  const [pingCount, setPingCount] = useState(0)
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const nextPingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 从localStorage恢复设置
    const savedSettings = localStorage.getItem('keepAliveSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setIsActive(settings.isActive || false)
        setInterval(settings.interval || 6)
        setPingCount(settings.pingCount || 0)
        
        if (settings.lastPing) {
          setLastPing(new Date(settings.lastPing))
        }
      } catch (error) {
        console.error('恢复保活设置失败:', error)
      }
    }
  }, [])

  useEffect(() => {
    // 保存设置到localStorage
    const settings = {
      isActive,
      interval,
      pingCount,
      lastPing: lastPing?.toISOString()
    }
    localStorage.setItem('keepAliveSettings', JSON.stringify(settings))
  }, [isActive, interval, pingCount, lastPing])

  useEffect(() => {
    if (isActive) {
      startKeepAlive()
    } else {
      stopKeepAlive()
    }

    return () => stopKeepAlive()
  }, [isActive, interval])

  useEffect(() => {
    // 更新下次ping时间
    if (isActive && lastPing) {
      const next = new Date(lastPing.getTime() + interval * 60 * 60 * 1000)
      setNextPing(next)
      
      // 设置下次ping的定时器
      const timeUntilNext = next.getTime() - Date.now()
      if (timeUntilNext > 0) {
        nextPingTimeoutRef.current = setTimeout(() => {
          performKeepAlive()
        }, timeUntilNext)
      }
    } else {
      setNextPing(null)
    }

    return () => {
      if (nextPingTimeoutRef.current) {
        clearTimeout(nextPingTimeoutRef.current)
        nextPingTimeoutRef.current = null
      }
    }
  }, [lastPing, interval, isActive])

  const startKeepAlive = () => {
    setStatus('running')
    
    // 立即执行一次
    performKeepAlive()
    
    // 设置定期执行
    intervalRef.current = setInterval(() => {
      performKeepAlive()
    }, interval * 60 * 60 * 1000) // 转换为毫秒
  }

  const stopKeepAlive = () => {
    setStatus('idle')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (nextPingTimeoutRef.current) {
      clearTimeout(nextPingTimeoutRef.current)
      nextPingTimeoutRef.current = null
    }
  }

  const performKeepAlive = async () => {
    try {
      setStatus('running')
      
      // 执行数据库保活请求
      const response = await fetch('/api/database/keepalive')
      
      if (response.ok) {
        setLastPing(new Date())
        setPingCount(prev => prev + 1)
        setStatus('running')
        
        console.log('数据库保活成功')
      } else {
        console.error('数据库保活失败:', response.status)
        setStatus('error')
      }
    } catch (error) {
      console.error('执行数据库保活时出错:', error)
      setStatus('error')
    }
  }

  const handleToggle = (checked: boolean) => {
    setIsActive(checked)
  }

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval)
    
    // 如果正在运行，重启服务以应用新间隔
    if (isActive) {
      stopKeepAlive()
      setTimeout(() => startKeepAlive(), 100)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return isActive ? '运行中' : '已停止'
      case 'error':
        return '错误'
      default:
        return '空闲'
    }
  }

  const formatTimeRemaining = () => {
    if (!nextPing) return null
    
    const now = Date.now()
    const remaining = nextPing.getTime() - now
    
    if (remaining <= 0) return '即将执行'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据库保活服务
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 开关控制 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">自动保活</div>
            <div className="text-xs text-gray-500">
              定期ping数据库以防止暂停
            </div>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* 间隔设置 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">执行间隔</div>
          <div className="flex gap-2">
            {[3, 6, 12, 24].map((hours) => (
              <Button
                key={hours}
                variant={interval === hours ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleIntervalChange(hours)}
                disabled={isActive}
              >
                {hours}小时
              </Button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            建议使用6小时间隔，既能保持数据库活跃又不会过于频繁
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">总计ping次数</div>
            <div className="text-lg font-semibold">{pingCount}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-500">上次执行</div>
            <div className="text-sm">
              {lastPing ? lastPing.toLocaleString() : '从未执行'}
            </div>
          </div>
        </div>

        {/* 下次执行时间 */}
        {nextPing && isActive && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium text-blue-800">下次执行</div>
              <div className="text-blue-600">
                {nextPing.toLocaleString()} ({formatTimeRemaining()}后)
              </div>
            </div>
          </div>
        )}

        {/* 手动执行按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={performKeepAlive}
            disabled={status === 'running' && isActive}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            立即执行
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPingCount(0)}
            className="flex-1"
          >
            重置计数
          </Button>
        </div>

        {/* 状态信息 */}
        {status === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              保活服务遇到错误，请检查网络连接和数据库状态
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}