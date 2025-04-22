"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";

const plans = [
  {
    id: "monthly",
    name: "月度会员",
    description: "30天无限使用，优先获得最新功能",
    price: "￥29.99",
    features: ["每天无限对话", "优先响应", "高级功能优先体验"],
  },
  {
    id: "yearly",
    name: "年度会员",
    description: "365天无限使用，全部功能无限制",
    price: "￥299.99",
    features: ["每天无限对话", "优先响应", "高级功能优先体验", "专属客服支持", "数据分析报告"],
    featured: true,
  },
  {
    id: "lifetime",
    name: "终身会员",
    description: "一次付费，终身无限使用",
    price: "￥999.99",
    features: ["每天无限对话", "优先响应", "高级功能优先体验", "专属客服支持", "数据分析报告", "社区VIP身份"],
  },
];

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    // 这里仅作演示，实际项目应连接支付接口
    setTimeout(() => {
      // 模拟支付完成
      alert("支付功能尚未开发，敬请期待！");
      setIsProcessing(false);
      // router.push("/chat");
    }, 2000);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar/>

      <main className="flex-1 container max-w-6xl mx-auto py-12 px-4 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight">升级您的 ChainHunter 使用体验</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            选择适合您的会员计划，享受无限对话和更多高级功能
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.featured
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  最受欢迎
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {plan.featured && <Crown className="h-4 w-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <ul className="space-y-2 mt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                >
                  {selectedPlan === plan.id && isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {selectedPlan === plan.id ? "已选择" : "选择此计划"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          {selectedPlan ? (
            <Button
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
              className="px-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                "立即购买"
              )}
            </Button>
          ) : (
            <p className="text-muted-foreground">请先选择一个会员计划</p>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            如有任何问题，请联系我们的客服支持
          </p>
        </div>
      </main>
    </div>
  );
}
