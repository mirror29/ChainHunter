"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Timer,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    dailyUsage?: number;
    maxDailyUsage?: number;
    isPremium?: boolean;
  };
}) {
  const { isMobile } = useSidebar();

  const hasUsageData =
    typeof user.dailyUsage === "number" &&
    typeof user.maxDailyUsage === "number";

  const remainingUsage = hasUsageData
    ? Math.max(0, (user.maxDailyUsage || 0) - (user.dailyUsage || 0))
    : 0;

  const isWarning =
    hasUsageData && remainingUsage <= (user.maxDailyUsage || 0) * 0.2;

  // 计算使用百分比
  const usedPercentage = hasUsageData
    ? Math.round(
        (((user.maxDailyUsage || 0) - remainingUsage) /
          (user.maxDailyUsage || 1)) *
          100
      )
    : 0;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* 剩余次数显示 - 与退出登录按钮样式一致 */}
            {hasUsageData && (
              <DropdownMenuItem className="cursor-default" disabled>
                <Timer className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm">今日剩余次数</span>
                    <span
                      className={
                        isWarning ? "text-amber-600 dark:text-amber-400" : ""
                      }
                    >
                      {remainingUsage}/{user.maxDailyUsage}
                    </span>
                  </div>
                  <Progress
                    value={usedPercentage}
                    className="h-1.5"
                    indicatorClassName={
                      isWarning
                        ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                        : "bg-gradient-to-r from-primary via-blue-500 to-cyan-400"
                    }
                  />
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
