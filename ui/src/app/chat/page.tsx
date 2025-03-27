"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  hash: string; // Unique hash for the conversation
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4 md:px-6 md:py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md bg-zinc-800 text-xs text-white shadow-sm">
          AI
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3 shadow-md",
          isUser
            ? "bg-zinc-800 text-zinc-50 shadow-zinc-800/10"
            : "bg-zinc-100 text-zinc-800 shadow-zinc-100/10 dark:bg-zinc-700 dark:text-zinc-50 dark:shadow-zinc-700/10"
        )}
      >
        <ReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == "▍") {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  );
                }

                children[0] = (children[0] as string).replace("`▍`", "▍");
              }

              const match = /language-(\w+)/.exec(className || "");

              return !inline ? (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white shadow-sm">
          You
        </div>
      )}
    </div>
  );
};

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
  const [currentChatHash, setCurrentChatHash] = useState<string>(uuidv4());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Load saved chats from the database
      loadSavedChats();
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

        const updatedMessages = [...messages, newUserMessage, botResponse];
        setMessages(updatedMessages);
        setIsLoading(false);

        // Save chat after receiving the response
        const chatTitle =
          updatedMessages.find((m) => m.role === "user")?.content.slice(0, 30) +
            "..." || "New Chat";

        const chatToSave: ChatSession = {
          id: currentChatId || Date.now().toString(),
          hash: currentChatHash,
          title: chatTitle,
          lastMessage: botResponse.content.slice(0, 40) + "...",
          timestamp: new Date(),
          messages: updatedMessages,
        };

        // Check and update the chat in the session list
        const hashExists = chatSessions.some(
          (session) => session.hash === currentChatHash
        );

        if (!hashExists) {
          setChatSessions((prev) => [chatToSave, ...prev]);
        } else {
          setChatSessions((prev) =>
            prev.map((session) =>
              session.hash === currentChatHash ? chatToSave : session
            )
          );
        }

        // Save to database
        saveChatToDatabase(chatToSave);
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
        hash: currentChatHash,
        title: chatTitle,
        lastMessage: messages[messages.length - 1].content.slice(0, 40) + "...",
        timestamp: new Date(),
        messages: [...messages],
      };

      // Check if the hash already exists to avoid duplicates
      const hashExists = chatSessions.some(
        (session) => session.hash === currentChatHash
      );

      if (!hashExists) {
        setChatSessions((prev) => [newChat, ...prev]);
        saveChatToDatabase(newChat);
      } else {
        // Update existing chat with same hash
        setChatSessions((prev) =>
          prev.map((session) =>
            session.hash === currentChatHash ? newChat : session
          )
        );
        saveChatToDatabase(newChat);
      }
    }

    // Generate a new hash for the new conversation
    const newChatHash = uuidv4();
    setCurrentChatHash(newChatHash);

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
      setCurrentChatHash(chat.hash);
    }
  };

  // Add function to save chat to database
  const saveChatToDatabase = async (chat: ChatSession) => {
    try {
      const response = await fetch("/api/chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chat.id,
          hash: chat.hash,
          title: chat.title,
          messages: chat.messages,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save chat:", await response.json());
      } else {
        const result = await response.json();
        // If this is a new chat, update the currentChatId with the ID from database
        if (!currentChatId && result.chat && result.chat.id) {
          setCurrentChatId(result.chat.id);
        }
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  // Load saved chats from the database
  const loadSavedChats = async () => {
    try {
      const response = await fetch("/api/chat/load");

      if (!response.ok) {
        console.error("Failed to load chats:", await response.json());
        return;
      }

      const data = await response.json();

      if (data.success && data.chats && Array.isArray(data.chats)) {
        setChatSessions(data.chats);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  // 添加删除聊天记录功能
  const handleDeleteChat = async (id: string) => {
    // 更新本地状态
    const updatedSessions = chatSessions.filter((chat) => chat.id !== id);
    setChatSessions(updatedSessions);

    // 如果删除的是当前聊天，重置当前聊天
    if (currentChatId === id) {
      startNewChat();
    }

    try {
      // 从数据库中删除
      const response = await fetch(`/api/chat/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete chat:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-hidden bg-background"
            >
              <ChatSidebar
                sessions={chatSessions}
                onSelectSession={loadChatSession}
                onNewChat={startNewChat}
                currentSessionId={currentChatId}
                onSignOut={() => signOut({ callbackUrl: "/" })}
                userEmail={session?.user?.email || "User"}
                userName={session?.user?.name || undefined}
                onDeleteChat={handleDeleteChat}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <header className="h-14 bg-muted/30 flex items-center px-4 justify-between mb-2 mx-2 rounded-lg">
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
              <h1 className="font-semibold text-lg">
                ChainHunter AI Assistant
              </h1>
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
                    <MessageBubble key={message.id} message={message} />
                  )
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md bg-zinc-800 text-xs text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-3 bg-zinc-700 rounded-lg shadow-md text-white">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="p-2 mx-4 bg-muted/50 rounded-md shadow-sm mt-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Uploaded files:
                </span>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-background text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1"
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
          <footer className="p-4 bg-muted/30 mx-2 mb-2 rounded-lg">
            <form
              onSubmit={handleSendMessage}
              className="max-w-3xl mx-auto flex flex-col gap-2"
            >
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="resize-none pr-12 min-h-[80px] shadow-sm focus:shadow-md transition-shadow"
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
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md"
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
    </div>
  );
}
