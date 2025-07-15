'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TrendingUp, TrendingDown, Minus, Settings, RefreshCw, ChevronDown } from 'lucide-react'

interface TradingSignal {
  id: string
  symbol: string
  signalType: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  price: number
  targetPrice?: number
  stopLoss?: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  timeframe: string
  analysis: string
  createdAt: string
  isRead: boolean
}

interface SignalPreferences {
  symbols: string[]
  signalTypes: string[]
  riskLevels: string[]
  timeframes: string[]
  pushEnabled: boolean
  minStrength: number
  maxDaily: number
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [preferences, setPreferences] = useState<SignalPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    symbol: '',
    signalType: '',
    riskLevel: ''
  })

  useEffect(() => {
    fetchSignals()
    fetchPreferences()
  }, [])

  const fetchSignals = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.symbol) params.append('symbol', filter.symbol)
      if (filter.signalType) params.append('signalType', filter.signalType)
      if (filter.riskLevel) params.append('riskLevel', filter.riskLevel)

      const response = await fetch(`/api/signals?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSignals(data.signals || [])
      }
    } catch (error) {
      console.error('获取信号失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/signals/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('获取偏好设置失败:', error)
    }
  }

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const generateDemoData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/signals/demo', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        console.log('演示数据创建成功:', data)
        // 重新获取信号列表
        await fetchSignals()
      }
    } catch (error) {
      console.error('生成演示数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">交易信号</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateDemoData}
            disabled={loading}
          >
            生成演示数据
          </Button>
          <Button
            variant="outline"
            onClick={fetchSignals}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals">信号列表</TabsTrigger>
          <TabsTrigger value="analysis">实时分析</TabsTrigger>
          <TabsTrigger value="arbitrage">套利机会</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          {/* 过滤器 */}
          <Card>
            <CardHeader>
              <CardTitle>筛选条件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {filter.symbol || '选择交易对'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, symbol: '' }))}>
                      全部
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, symbol: 'BTCUSDT' }))}>
                      BTC/USDT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, symbol: 'ETHUSDT' }))}>
                      ETH/USDT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, symbol: 'BNBUSDT' }))}>
                      BNB/USDT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {filter.signalType || '信号类型'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, signalType: '' }))}>
                      全部
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, signalType: 'BUY' }))}>
                      买入
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, signalType: 'SELL' }))}>
                      卖出
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, signalType: 'HOLD' }))}>
                      观望
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {filter.riskLevel || '风险等级'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, riskLevel: '' }))}>
                      全部
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, riskLevel: 'LOW' }))}>
                      低风险
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, riskLevel: 'MEDIUM' }))}>
                      中风险
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter(prev => ({ ...prev, riskLevel: 'HIGH' }))}>
                      高风险
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={fetchSignals} className="mt-4">
                应用筛选
              </Button>
            </CardContent>
          </Card>

          {/* 信号列表 */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : signals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无交易信号</div>
            ) : (
              signals.map((signal) => (
                <Card key={signal.id} className={`${!signal.isRead ? 'border-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        {getSignalIcon(signal.signalType)}
                        <span className="font-semibold text-lg">{signal.symbol}</span>
                        <Badge className={getSignalColor(signal.signalType)}>
                          {signal.signalType}
                        </Badge>
                        <Badge className={getRiskColor(signal.riskLevel)}>
                          {signal.riskLevel}
                        </Badge>
                        <Badge variant="outline">{signal.timeframe}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(signal.createdAt).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          强度: {(signal.strength * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">当前价格</div>
                        <div className="font-semibold">${signal.price.toLocaleString()}</div>
                      </div>
                      {signal.targetPrice && (
                        <div>
                          <div className="text-sm text-gray-500">目标价格</div>
                          <div className="font-semibold text-green-600">
                            ${signal.targetPrice.toLocaleString()}
                          </div>
                        </div>
                      )}
                      {signal.stopLoss && (
                        <div>
                          <div className="text-sm text-gray-500">止损价格</div>
                          <div className="font-semibold text-red-600">
                            ${signal.stopLoss.toLocaleString()}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-500">风险/收益</div>
                        <div className="font-semibold">
                          {signal.targetPrice && signal.stopLoss ? 
                            `${((signal.targetPrice - signal.price) / (signal.price - signal.stopLoss)).toFixed(2)}:1`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">{signal.analysis}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>实时技术分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                实时分析功能正在开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arbitrage">
          <Card>
            <CardHeader>
              <CardTitle>套利机会</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                套利机会检测功能正在开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}