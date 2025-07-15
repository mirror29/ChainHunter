'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, Check, X, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SignalNotification {
  id: string
  sentAt: string
  readAt: string | null
  signal: {
    symbol: string
    signalType: 'BUY' | 'SELL' | 'HOLD'
    strength: number
    price: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    analysis: string
    createdAt: string
  }
}

interface SignalNotificationsProps {
  className?: string
}

export function SignalNotifications({ className }: SignalNotificationsProps) {
  const [notifications, setNotifications] = useState<SignalNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // 每30秒检查一次新通知
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/signals/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        
        const unread = data.notifications?.filter((n: SignalNotification) => !n.readAt).length || 0
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/signals/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds,
          action: 'markAsRead'
        })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            notificationIds.includes(n.id)
              ? { ...n, readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !n.readAt)
      .map(n => n.id)
    
    if (unreadIds.length > 0) {
      markAsRead(unreadIds)
    }
  }

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return 'bg-green-100 text-green-800'
      case 'SELL':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 通知按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* 通知面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* 头部 */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">交易信号通知</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    全部已读
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 通知列表 */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  暂无通知
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.readAt ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => !notification.readAt && markAsRead([notification.id])}
                  >
                    <div className="flex items-start gap-2">
                      {getSignalIcon(notification.signal.signalType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {notification.signal.symbol}
                          </span>
                          <Badge className={`text-xs ${getSignalColor(notification.signal.signalType)}`}>
                            {notification.signal.signalType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.signal.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          价格: ${notification.signal.price.toLocaleString()} | 
                          强度: {(notification.signal.strength * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {notification.signal.analysis}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.sentAt).toLocaleString()}
                        </div>
                      </div>
                      {!notification.readAt && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}