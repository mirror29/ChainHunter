'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Server,
  Activity,
  ExternalLink,
  GitBranch,
  RefreshCw
} from 'lucide-react'

export default function AdminPage() {
  const [status, setStatus] = useState<string>('未知')
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const testDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/test')
      const data = await response.json()

      if (response.ok) {
        setStatus('正常')
      } else {
        setStatus('错误: ' + data.error)
      }
      setLastChecked(new Date())
    } catch (error) {
      setStatus('连接失败')
    } finally {
      setLoading(false)
    }
  }

  const executeKeepAlive = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/keepalive', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setStatus('保活成功')
      } else {
        setStatus('保活失败')
      }
      setLastChecked(new Date())
    } catch (error) {
      setStatus('保活执行失败')
    } finally {
      setLoading(false)
    }
  }

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank')
  }

  const openGitHubActions = () => {
    window.open('https://github.com/your-username/ChainHunter/actions', '_blank')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">数据库管理</h1>
          <p className="text-gray-600 mt-1">
            监控和管理Supabase数据库连接状态，防止自动暂停
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openSupabase}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Supabase控制台
          </Button>
          <Button variant="outline" onClick={openGitHubActions}>
            <GitBranch className="h-4 w-4 mr-2" />
            GitHub Actions
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">数据库状态</TabsTrigger>
          <TabsTrigger value="keepalive">保活服务</TabsTrigger>
          <TabsTrigger value="automation">自动化设置</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {/* 数据库状态卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                数据库连接状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">当前状态:</span>
                <Badge variant={status.includes('错误') || status.includes('失败') ? 'destructive' : 'default'}>
                  {status}
                </Badge>
              </div>

              {lastChecked && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">最后检查:</span>
                  <span className="text-sm">{lastChecked.toLocaleString()}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={testDatabase}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                  测试连接
                </Button>

                <Button
                  onClick={executeKeepAlive}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                  执行保活
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                快速操作
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => fetch('/api/database/keepalive')}
              >
                <Database className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">数据库Ping</div>
                  <div className="text-xs text-gray-500">检查连接状态</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => fetch('/api/database/keepalive', { method: 'POST' })}
              >
                <Server className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">数据库预热</div>
                  <div className="text-xs text-gray-500">执行多项操作激活</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <Activity className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">刷新页面</div>
                  <div className="text-xs text-gray-500">重新加载所有状态</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keepalive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>客户端保活服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">保活服务说明</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 浏览器端定时任务，定期ping数据库保持连接活跃</p>
                  <p>• 建议间隔：6小时（平衡效果和资源消耗）</p>
                  <p>• 仅在用户在线时工作，需要配合GitHub Actions使用</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">注意事项</h4>
                <div className="text-sm text-amber-700">
                  <p>客户端保活仅在浏览器页面打开时有效，建议同时使用GitHub Actions作为主要保活机制。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Actions自动化</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">配置状态</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">工作流文件:</span>
                    <Badge variant="outline">已配置</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">执行频率:</span>
                    <span className="text-sm">每6小时</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">上次执行:</span>
                    <span className="text-sm text-gray-500">查看GitHub Actions</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">所需设置</h4>
                <div className="text-sm text-amber-700 space-y-1">
                  <p><strong>GitHub Secrets 配置:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code>APP_URL</code>: 您的应用部署URL</li>
                    <li><code>ALERT_WEBHOOK</code>: 失败通知webhook (可选)</li>
                  </ul>
                </div>
              </div>

              <Button onClick={openGitHubActions} className="w-full">
                <GitBranch className="h-4 w-4 mr-2" />
                查看GitHub Actions执行历史
              </Button>
            </CardContent>
          </Card>

          {/* 第三方保活服务 */}
          <Card>
            <CardHeader>
              <CardTitle>第三方保活服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                除了GitHub Actions，您还可以使用以下第三方服务来确保数据库保活：
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Uptime Robot</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    免费的网站监控服务，可以定期ping您的保活端点
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer">
                      访问服务
                    </a>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Pingdom</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    专业的网站性能监控服务，提供详细的响应时间统计
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.pingdom.com" target="_blank" rel="noopener noreferrer">
                      访问服务
                    </a>
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">保活端点</h4>
                <div className="text-sm text-green-700">
                  <p>配置第三方服务监控以下端点：</p>
                  <code className="block mt-2 p-2 bg-white rounded text-black">
                    GET {typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/api/database/keepalive
                  </code>
                  <p className="mt-2">建议监控频率：每6小时</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
