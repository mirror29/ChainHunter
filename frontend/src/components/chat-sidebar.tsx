"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  Trash2,
  Timer,
  TrendingUp,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: any[]; // Using any for simplicity, but should match the Message interface
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  currentSessionId: string | null;
  onSignOut: () => void;
  userEmail: string;
  userName?: string;
  onDeleteChat?: (id: string) => void;
  userDailyUsage?: number;
  userMaxDailyUsage?: number;
  userIsPremium?: boolean;
}

export function ChatSidebar({
  sessions,
  onSelectSession,
  onNewChat,
  currentSessionId,
  onSignOut,
  userEmail,
  userName = "User",
  onDeleteChat,
  userDailyUsage,
  userMaxDailyUsage,
  userIsPremium,
}: ChatSidebarProps) {
  const userInitial = userName
    ? userName.charAt(0).toUpperCase()
    : userEmail && typeof userEmail === "string"
    ? userEmail.charAt(0).toUpperCase()
    : "U";

  const router = useRouter();

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(id);
    }
  };

  const hasUsageData =
    typeof userDailyUsage === "number" && typeof userMaxDailyUsage === "number";

  // 计算剩余次数
  const remainingUsage = hasUsageData
    ? Math.max(0, (userMaxDailyUsage || 0) - (userDailyUsage || 0))
    : 0;

  // 判断是否低于阈值
  const isWarning =
    hasUsageData && remainingUsage <= (userMaxDailyUsage || 0) * 0.2;

  // 计算使用百分比
  const usedPercentage = hasUsageData
    ? Math.round(
        (((userMaxDailyUsage || 0) - remainingUsage) /
          (userMaxDailyUsage || 1)) *
          100
      )
    : 0;

  // 处理点击剩余次数跳转到付费页面
  const handleUpgradeClick = () => {
    router.push("/payment");
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg m-2">
        <Link href="/" className="flex items-baseline">
          <div className="relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600 font-bold text-lg">
              Chain
            </span>
            <motion.div
              className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600"
              animate={{ width: "100%" }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: "easeOut",
              }}
            />
          </div>
          <motion.span
            className="dark:text-slate-200 font-bold text-lg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Hunter
          </motion.span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 rounded-full shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        {/* Trading Signals Button */}
        <Link href="/signals" className="w-full">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 rounded-full shadow-sm hover:shadow-md cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            交易信号
          </Button>
        </Link>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-hidden px-2">
        <div className="h-full overflow-y-auto">
          <div className="space-y-2 flex-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs mt-1">Start a new conversation</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`rounded-lg transition-colors ${
                    currentSessionId === session.id
                      ? "bg-muted shadow-md"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    onClick={() => onSelectSession(session.id)}
                    className="w-full text-left p-3 flex-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium truncate max-w-[130px]">
                        {session.title}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0 min-w-[70px] justify-end">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(session.timestamp), "MM-dd")}
                        </span>
                        {onDeleteChat && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 cursor-pointer ml-1 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3 text-destructive hover:text-destructive" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-3 shadow-md border-0"
                              align="end"
                            >
                              <p className="text-sm mb-2">确认删除该会话？</p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChat(session.id, e);
                                  }}
                                >
                                  删除
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {session.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Database Status and Admin Link */}
      {/* <div className="px-4 pb-2">
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Database className="h-3 w-3" />
            <span className="text-gray-600">数据库状态</span>
          </div>
          <Link href="/admin" className="w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs"
            >
              <Database className="h-3 w-3" />
              数据库管理
            </Button>
          </Link>
        </div>
      </div> */}

      {/* User Info and Settings */}
      <div className="p-4 m-2 mt-0 bg-muted/50 rounded-lg flex item-center">
        <div className="w-full flex items-center justify-start gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium truncate">
              {userName || userEmail || "User"}
            </p>
            {userName && userEmail && (
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 shadow-md border-0 p-2" align="end">
            <div>
              <div className="space-y-2">
                {hasUsageData && (
                  <div
                    onClick={handleUpgradeClick}
                    className="flex flex-col px-3 py-2 gap-2 border-0 cursor-pointer w-full"
                  >
                    <div
                      className="flex justify-between items-center mb-1 text-xs cursor-pointer hover:text-primary transition-colors"
                      title="点击升级套餐"
                    >
                      <span>今日剩余次数:</span>
                      <span
                        className={isWarning ? "text-red-500 font-bold" : ""}
                      >
                        {remainingUsage} / {userMaxDailyUsage}
                      </span>
                    </div>
                    <Progress
                      value={usedPercentage}
                      className="h-1"
                      indicatorClassName={
                        isWarning
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                          : "bg-gradient-to-r from-primary via-blue-500 to-cyan-400"
                      }
                    />
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-0 cursor-pointer"
                  onClick={onSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
