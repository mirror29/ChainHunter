import Link from "next/link";
import { Button } from "@/components/ui/button";

// 简单的404页面，不使用任何需要特殊Provider的组件
export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">页面未找到</p>
      <Button asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
