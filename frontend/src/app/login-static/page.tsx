import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

// 简化的登录页面，用于静态生成
export default function StaticLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ChainHunter
          </CardTitle>
          <CardDescription className="text-center">
            请登录以使用 ChainHunter AI 助手
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 text-sm bg-muted border border-muted rounded-md">
            登录页面加载中...请等待或点击下面的按钮返回首页。
          </div>
          <Button asChild className="w-full">
            <Link href="/">返回首页</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
