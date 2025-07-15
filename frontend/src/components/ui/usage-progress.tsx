"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface UsageInfo {
  daily: number;
  max: number;
  remaining: number;
  isPremium: boolean;
}

export interface UsageProgressProps {
  usage?: {
    dailyUsage: number;
    maxDailyUsage: number;
    isPremium: boolean;
  };
  loading?: boolean;
}

export function UsageProgress({ usage, loading = false }: UsageProgressProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-2 px-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  // 计算剩余使用次数
  const remaining = Math.max(0, usage.maxDailyUsage - usage.dailyUsage);

  // 如果是会员用户，显示特殊样式
  if (usage.isPremium) {
    return (
      <div className="px-2 pb-2">
        <div className="text-xs text-center font-medium text-primary mb-1">
          会员用户
        </div>
        <Progress
          value={100}
          className="h-2 bg-primary/20"
          indicatorClassName="bg-gradient-to-r from-primary via-blue-500 to-cyan-400"
        />
      </div>
    );
  }

  const usedPercentage = Math.round(
    ((usage.maxDailyUsage - remaining) / usage.maxDailyUsage) * 100
  );
  const isWarning = remaining <= usage.maxDailyUsage * 0.2;

  return (
    <div className="px-2 pb-2">
      <div className="flex justify-between text-xs mb-1">
        <span
          className={`font-medium ${
            isWarning
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          }`}
        >
          今日剩余: {remaining}
        </span>
        <span className="text-muted-foreground">
          总计: {usage.maxDailyUsage}
        </span>
      </div>
      <Progress
        value={usedPercentage}
        className="h-2 bg-primary/10"
        indicatorClassName={
          isWarning
            ? "bg-gradient-to-r from-amber-600 to-red-500"
            : "bg-gradient-to-r from-primary via-blue-500 to-cyan-400"
        }
      />
    </div>
  );
}
