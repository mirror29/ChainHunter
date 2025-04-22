import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsageInfo {
  daily: number;
  max: number;
  remaining: number;
  isPremium: boolean;
}

export interface UsageBadgeProps {
  className?: string;
  showButton?: boolean;
  usage?: {
    dailyUsage?: number;
    maxDailyUsage?: number;
    isPremium?: boolean;
  };
  isLoading?: boolean;
}

export function UsageBadge({
  className = "",
  showButton = true,
  usage: externalUsage,
  isLoading = false,
}: UsageBadgeProps) {
  const router = useRouter();

  // 处理外部提供的数据
  let formattedUsage: UsageInfo | null = null;
  if (
    externalUsage &&
    typeof externalUsage.dailyUsage === "number" &&
    typeof externalUsage.maxDailyUsage === "number"
  ) {
    const remaining = Math.max(
      0,
      externalUsage.maxDailyUsage - externalUsage.dailyUsage
    );
    formattedUsage = {
      daily: externalUsage.dailyUsage,
      max: externalUsage.maxDailyUsage,
      remaining,
      isPremium: externalUsage.isPremium || false,
    };
  }

  const handleUpgrade = () => {
    router.push("/payment");
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className={`py-1 px-3 ${className}`}>
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        加载中...
      </Badge>
    );
  }

  if (!formattedUsage) {
    return null;
  }

  // 如果是会员用户，显示不同的徽章
  if (formattedUsage.isPremium) {
    return (
      <Badge
        variant="outline"
        className={`bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-white border-0 py-1 px-3 ${className}`}
      >
        <Zap className="mr-1 h-3 w-3" />
        会员用户
      </Badge>
    );
  }

  // 剩余次数少于20%时显示警告颜色
  const isWarning =
    !formattedUsage.isPremium &&
    formattedUsage.remaining <= formattedUsage.max * 0.2;

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`py-1 px-3 ${className} ${
          isWarning
            ? "text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400"
            : ""
        }`}
      >
        {isWarning && <AlertCircle className="mr-1 h-3 w-3" />}
        今日剩余: {formattedUsage.remaining}/{formattedUsage.max}
      </Badge>

      {showButton && formattedUsage.remaining < formattedUsage.max * 0.5 && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 px-2 gap-1"
          onClick={handleUpgrade}
        >
          <CreditCard className="h-3 w-3" />
          升级
        </Button>
      )}
    </div>
  );
}
