"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSidebar } from "@/components/chat-sidebar";
import {
  ChevronLeft,
  ChevronRight,
  SendHorizontal,
  Plus,
  Upload,
  Bot,
  User,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content:
        "I am ChainHunter AI, ready to help you explore blockchain data and insights.",
      timestamp: new Date(),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Hello! I'm your ChainHunter AI assistant. How can I help you today with blockchain analysis?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent | null = null) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I received your message: "${input}". This is a placeholder response. In a real implementation, this would be an API call to your AI backend.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulate file upload
    setTimeout(() => {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles((prev) => [...prev, ...fileNames]);
      setIsUploading(false);

      // Add message about uploaded files
      const fileMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `Uploaded files: ${fileNames.join(", ")}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fileMessage]);

      // Simulate AI response about files
      setIsLoading(true);
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've received the following files: ${fileNames.join(
            ", "
          )}. What would you like me to do with them?`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    }, 1500);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const startNewChat = () => {
    // Save current chat if it exists
    if (messages.length > 2) {
      const chatTitle =
        messages.find((m) => m.role === "user")?.content.slice(0, 30) + "..." ||
        "New Chat";
      const newChat: ChatSession = {
        id: Date.now().toString(),
        title: chatTitle,
        lastMessage: messages[messages.length - 1].content.slice(0, 40) + "...",
        timestamp: new Date(),
        messages: [...messages],
      };

      setChatSessions((prev) => [newChat, ...prev]);
    }

    // Reset current chat
    setMessages([
      {
        id: "1",
        role: "system",
        content:
          "I am ChainHunter AI, ready to help you explore blockchain data and insights.",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Hello! I'm your ChainHunter AI assistant. How can I help you today with blockchain analysis?",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(null);
    setUploadedFiles([]);
  };

  const loadChatSession = (chatId: string) => {
    const chat = chatSessions.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chat.id);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full border-r border-border overflow-hidden"
          >
            <ChatSidebar
              sessions={chatSessions}
              onSelectSession={loadChatSession}
              onNewChat={startNewChat}
              currentSessionId={currentChatId}
              onSignOut={() => signOut({ callbackUrl: "/" })}
              userEmail={session?.user?.email || "User"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <header className="h-14 border-b border-border flex items-center px-4 justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="mr-2"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            <h1 className="font-semibold text-lg">ChainHunter AI Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={startNewChat}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(
              (message, index) =>
                message.role !== "system" && (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } message-${message.role === "user" ? "out" : "in"}`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={
                          message.role === "assistant"
                            ? "bg-primary/10"
                            : "bg-secondary"
                        }
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                        <AvatarFallback>
                          {message.role === "assistant" ? "AI" : "You"}
                        </AvatarFallback>
                      </Avatar>
                      <Card
                        className={`p-3 ${
                          message.role === "assistant"
                            ? "bg-muted text-foreground shadow-sm"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </Card>
                    </div>
                  </div>
                )
            )}
            {isLoading && (
              <div className="flex justify-start message-in">
                <div className="flex items-start gap-3">
                  <Avatar className="bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Card className="p-3 bg-muted shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="p-2 mx-4 bg-muted/50 rounded-t-md border border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Uploaded files:
              </span>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-background text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  {file}
                  <button
                    className="p-0.5 rounded-full hover:bg-muted"
                    onClick={() =>
                      setUploadedFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <footer className="p-4 border-t border-border">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto flex flex-col gap-2"
          >
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="resize-none pr-12 min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={triggerFileUpload}
                        disabled={isLoading || isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload File</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                  disabled={!input.trim() || isLoading}
                >
                  <SendHorizontal className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
          </form>
        </footer>
      </div>
    </div>
  );
}
