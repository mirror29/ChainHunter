"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, MessageSquare, Plus, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

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
}

export function ChatSidebar({
  sessions,
  onSelectSession,
  onNewChat,
  currentSessionId,
  onSignOut,
  userEmail,
}: ChatSidebarProps) {
  const [activeView, setActiveView] = useState<"chats" | "settings">("chats");

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-baseline">
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
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeView === "chats"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveView("chats")}
        >
          Chats
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeView === "settings"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveView("settings")}
        >
          Settings
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeView === "chats" ? (
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left rounded-lg p-3 transition-colors ${
                      currentSessionId === session.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium truncate max-w-[180px]">
                        {session.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.timestamp), "MMM d")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {session.lastMessage}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar>
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Logged in as user
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-2 hover:bg-muted"
          onClick={() => setActiveView("settings")}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium truncate">{userEmail}</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
