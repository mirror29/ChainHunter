"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
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
  Bot,
  Loader2,
  X,
  MessageSquare,
  Database,
  Coins,
  LineChart,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { ChainHunterLogo } from "@/components/ui/chain-hunter-logo";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  hash: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages?: Message[]; // 明确设置为可选
}

const MessageBubble = ({
  message,
  session,
}: {
  message: Message;
  session?: Session | null;
}) => {
  const isUser = message.role === "user";
  const userInitial =
    session?.user?.name?.[0] || session?.user?.email?.[0] || "U";
  const isLoading = !isUser && message.content === "正在思考中...";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4 md:px-6 md:py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md bg-zinc-800 text-xs text-white shadow-sm">
          <Bot className="h-4 w-4" />
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
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>思考中...</span>
          </div>
        ) : (
          <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const content = String(children).replace(/\n$/, "");
                  const lang = match && match[1] ? match[1] : "";

                  return !className || !className.startsWith("language-") ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <CodeBlock
                      key={Math.random()}
                      language={lang}
                      value={content}
                      {...props}
                    />
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white shadow-sm uppercase font-medium">
          {userInitial}
        </div>
      )}
    </div>
  );
};

// 创建示例问题组件
interface QuickPromptProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const QuickPrompt = ({
  icon,
  title,
  description,
  onClick,
}: QuickPromptProps) => (
  <button
    onClick={onClick}
    className="p-4 rounded-lg border border-muted bg-card hover:bg-accent/70 hover:shadow-lg transition-colors text-left w-full cursor-pointer"
  >
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  </button>
);

// 欢迎页面组件
const WelcomeScreen = ({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string) => void;
}) => {
  const { t } = useI18n();

  const prompts = [
    {
      icon: <Coins className="h-5 w-5" />,
      title: "比特币当前价格",
      description: "获取比特币的最新价格以及24小时价格变动",
      prompt: "比特币当前的价格是多少？请同时告诉我24小时内的价格变动百分比。",
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "分析大额转账",
      description: "查询并分析最近的大额转账交易及其可能影响",
      prompt:
        "请帮我查询过去24小时内以太坊上最大的5笔转账交易，并分析它们可能对市场造成的影响。",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "市场趋势分析",
      description: "分析当前加密货币市场整体趋势和关键指标",
      prompt:
        "请分析当前加密货币市场的整体趋势，重点关注比特币、以太坊和主要的山寨币表现。",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "项目背景介绍",
      description: "了解ChainHunter的功能和使用方法",
      prompt: "ChainHunter是什么项目？它有什么主要功能？",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 mt-[10%]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center items-center mb-4">
          <ChainHunterLogo size="xl" showAI={true} />
        </div>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          {t("hero.subtitle")}
        </p>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {prompts.map((prompt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
          >
            <QuickPrompt
              icon={prompt.icon}
              title={prompt.title}
              description={prompt.description}
              onClick={() => onSelectPrompt(prompt.prompt)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 使用any类型来绕过类型检查
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatHash, setCurrentChatHash] = useState<string>(uuidv4());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [lastSavedChatHash, setLastSavedChatHash] = useState<string>("");
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(0);
  const [isSavingChat, setIsSavingChat] = useState(false); // 添加保存状态标志
  // 添加本地使用数据状态
  const [userDailyUsage, setUserDailyUsage] = useState<number | undefined>(
    undefined
  );
  const [userMaxDailyUsage, setUserMaxDailyUsage] = useState<
    number | undefined
  >(undefined);
  const [userIsPremium, setUserIsPremium] = useState<boolean | undefined>(
    undefined
  );

  // 添加流式响应控制状态
  const [isStreaming, setIsStreaming] = useState(false);
  const streamControllerRef = useRef<AbortController | null>(null);

  // 处理停止回复的函数
  const handleStopResponse = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  // 加载用户使用情况函数
  const loadUserUsage = async () => {
    try {
      console.log("加载用户使用情况...");
      const response = await fetch("/api/user/usage");
      if (!response.ok) {
        throw new Error("获取使用次数失败");
      }

      const data = await response.json();
      if (data.success && data.usage) {
        console.log("用户使用情况加载成功:", data.usage);
        setUserDailyUsage(data.usage.daily);
        setUserMaxDailyUsage(data.usage.max);
        setUserIsPremium(data.usage.isPremium);
      }
    } catch (error) {
      console.error("加载用户使用情况失败:", error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // 只加载一次用户使用情况
      loadUserUsage();

      // Load saved chats from the database
      loadSavedChats().then(() => {
        // 标记初始加载完成
        setFirstLoadComplete(true);
      });
    }
  }, [status, router]);

  // 单独处理欢迎页面显示逻辑
  useEffect(() => {
    // 只在组件初始化后响应数据变化
    if (!isInitialized || !firstLoadComplete) return;

    // 检查是否应该显示欢迎页面
    if (messages.length > 0 || currentChatId !== null) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [messages.length, currentChatId, isInitialized, firstLoadComplete]);

  // 在数据加载完成后标记为已初始化
  useEffect(() => {
    if (status === "authenticated" && firstLoadComplete) {
      setIsInitialized(true);
    }
  }, [status, firstLoadComplete]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent | null = null) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 创建助手消息占位ID - 全局声明，解决linter错误
    let assistantMessageId = "";

    // 确保关闭欢迎页面
    setShowWelcome(false);

    try {
      // 创建 AbortController 用于可能的中断
      streamControllerRef.current = new AbortController();
      setIsStreaming(true);

      // 首先更新使用次数并检查是否超出限制
      const usageResponse = await fetch("/api/user/updateUsage", {
        method: "POST",
      });

      // 如果请求不成功，检查是否是因为超出限制
      if (!usageResponse.ok) {
        const errorData = await usageResponse.json();

        // 如果是超出限制，提示用户并重定向到付费页面
        if (errorData.limitExceeded) {
          alert("您今日的免费使用次数已用完，请升级会员继续使用。");
          router.push("/payment");
          return;
        }

        // 其他错误则继续尝试发送消息
        console.error("更新使用次数失败:", errorData);
      } else {
        // 请求成功，直接在前端更新使用次数
        const usageData = await usageResponse.json();
        if (usageData.success && usageData.usage) {
          // 更新本地状态
          setUserDailyUsage(usageData.usage.daily);
          setUserMaxDailyUsage(usageData.usage.max);
          setUserIsPremium(usageData.usage.isPremium);
          console.log("已更新使用次数:", usageData.usage);
        }
      }

      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      setIsLoading(true);

      // 创建助手消息占位
      assistantMessageId = (Date.now() + 1).toString();
      const pendingAssistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "正在思考中...", // 使用loading文本而非光标
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, pendingAssistantMessage]);

      // 调用支持流式响应的API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          chatId: currentChatId,
          chatHash: currentChatHash,
          stream: true,
        }),
        signal: streamControllerRef.current.signal, // 添加中断信号
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // 读取流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      let fullContent = "";
      let receivedChatId = null;
      let doneMessageProcessed = false; // 增加标记，避免重复处理完成消息

      // 初始化消息内容为空
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: "" } : msg
        )
      );

      // 处理流式响应
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解析响应块
        const chunk = new TextDecoder().decode(value);

        try {
          // 尝试解析每行数据（Python后端每个delta是单独的一行JSON）
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              if (!line.trim()) continue;

              const chunkData = JSON.parse(line);

              // 保存聊天ID
              if (chunkData.chatId && !receivedChatId) {
                receivedChatId = chunkData.chatId;
              }

              // 处理delta部分
              if (chunkData.delta) {
                fullContent += chunkData.delta;

                // 更新消息内容
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }

              // 处理完成消息，确保只处理一次
              if (chunkData.done && !doneMessageProcessed) {
                doneMessageProcessed = true; // 标记已处理完成消息

                // 使用完整消息而不是累加的内容，以防止丢失
                if (chunkData.message) {
                  fullContent = chunkData.message;
                }

                // 完成消息
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );

                // 处理聊天ID
                if (receivedChatId && !currentChatId) {
                  setCurrentChatId(receivedChatId);
                }

                // 确保我们有足够的消息内容来保存且没有正在进行的保存操作
                if (fullContent.trim() !== "" && !isSavingChat) {
                  // 保存聊天到数据库和会话列表
                  const updatedMessages = [
                    ...messages.filter((m) => m.id !== assistantMessageId),
                    newUserMessage,
                    {
                      ...pendingAssistantMessage,
                      content: fullContent,
                    },
                  ];

                  // 更新聊天标题和会话
                  const chatTitle =
                    updatedMessages
                      .find((m) => m.role === "user")
                      ?.content.slice(0, 30) + "..." || "New Chat";

                  const chatToSave = {
                    id:
                      currentChatId || receivedChatId || Date.now().toString(),
                    hash: currentChatHash,
                    title: chatTitle,
                    lastMessage: fullContent.slice(0, 40) + "...",
                    timestamp: new Date(),
                    messages: updatedMessages,
                  };

                  // 处理会话列表更新
                  const hashExists = chatSessions.some(
                    (session) => session.hash === currentChatHash
                  );

                  // 先更新本地会话列表
                  if (!hashExists) {
                    setChatSessions((prev) => [chatToSave, ...prev]);
                  } else {
                    setChatSessions((prev) =>
                      prev.map((session) =>
                        session.hash === currentChatHash ? chatToSave : session
                      )
                    );
                  }

                  // 保存到数据库
                  // 使用setTimeout避免阻塞UI渲染
                  setTimeout(() => {
                    saveChatToDatabase(chatToSave);
                  }, 0);
                } else {
                  if (isSavingChat) {
                    console.log("已有保存操作进行中，跳过本次保存");
                  } else {
                    console.log("接收到的内容为空，不保存会话");
                  }
                }
              }

              // 处理错误
              if (chunkData.error) {
                console.error("响应错误:", chunkData.message);
                throw new Error(chunkData.message || "处理请求时出错");
              }
            } catch (lineError) {
              console.error("解析JSON行错误:", line, lineError);
            }
          }
        } catch (e) {
          // 如果不是有效的JSON，可能是其他格式的响应
          console.error("解析chunk错误:", chunk, e);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      // 更新消息显示错误
      const assistantMsg = messages.find(
        (m) =>
          m.role === "assistant" &&
          (m.content === "正在思考中..." || m.content === "")
      );

      if (assistantMsg) {
        // 如果是中断错误，显示中断消息
        const errorMessage =
          error.name === "AbortError"
            ? "回复已被用户中断"
            : "很抱歉，处理您的请求时出现错误。请稍后再试。";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsg.id ? { ...msg, content: errorMessage } : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      streamControllerRef.current = null;
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
    if (messages.length > 2 && !isSavingChat) {
      // 检查当前是否有保存操作
      const chatTitle =
        messages.find((m) => m.role === "user")?.content.slice(0, 30) + "..." ||
        "New Chat";
      const newChat = {
        id: currentChatId || Date.now().toString(),
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

      // 先更新本地状态
      if (!hashExists) {
        // 这是一个新的对话，添加到列表
        setChatSessions((prev) => [newChat, ...prev]);
      } else {
        // 这个会话已经存在，仅更新列表中的数据
        setChatSessions((prev) =>
          prev.map((session) =>
            session.hash === currentChatHash ? newChat : session
          )
        );
      }

      saveChatToDatabase(newChat);
    } else {
      console.log("消息少于2条或正在保存中，不保存空会话");
    }

    // Generate a new hash for the new conversation
    const newChatHash = uuidv4();
    console.log("生成新会话哈希:", newChatHash);
    setCurrentChatHash(newChatHash);

    // Reset current chat
    setMessages([]);
    setCurrentChatId(null);
    setUploadedFiles([]);
  };

  const loadChatSession = async (chatId: string) => {
    try {
      setIsLoading(true);

      // 查找会话信息
      const chatInfo = chatSessions.find((c) => c.id === chatId);

      if (!chatInfo) {
        return;
      }

      // 如果缓存中已经有完整的消息内容，则直接使用
      if (chatInfo.messages && chatInfo.messages.length > 0) {
        setMessages(chatInfo.messages as Message[]);
        setCurrentChatId(chatInfo.id);
        setCurrentChatHash(chatInfo.hash);
        return;
      }

      const response = await fetch(`/api/chat/details?id=${chatId}`);

      if (!response.ok) {
        throw new Error("无法加载聊天详情");
      }

      const data = await response.json();

      if (data.success && data.chat && data.chat.messages) {
        // 更新会话列表中的消息缓存，使用as any绕过类型检查
        setChatSessions((prev) => {
          return prev.map((s) => {
            if (s.id === chatId) {
              return {
                ...s,
                messages: data.chat.messages,
              } as any;
            }
            return s;
          });
        });

        // 设置当前聊天信息
        setMessages(data.chat.messages);
        setCurrentChatId(chatId);
        setCurrentChatHash(chatInfo.hash);
      } else {
        console.error("加载的聊天详情格式不正确", data);
      }
    } catch (error) {
      console.error("加载聊天详情出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改保存到数据库的函数，添加防重复保存逻辑
  const saveChatToDatabase = async (chat: ChatSession) => {
    // 检查是否是同一个会话的重复保存
    const now = Date.now();
    if (
      chat.hash === lastSavedChatHash &&
      now - lastSavedTimestamp < 5000 // 5秒内的重复保存
    ) {
      return;
    }

    // 检查是否已在保存中
    if (isSavingChat) {
      return;
    }

    try {
      // 立即更新标记和时间戳，防止并发调用
      setIsSavingChat(true); // 标记正在保存
      setLastSavedChatHash(chat.hash);
      setLastSavedTimestamp(now);

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
        const errorData = await response.json();
        console.error("保存聊天失败:", errorData);
      } else {
        const result = await response.json();
        // If this is a new chat, update the currentChatId with the ID from database
        if (!currentChatId && result.chat && result.chat.id) {
          setCurrentChatId(result.chat.id);
        }
      }
    } catch (error) {
      console.error("保存聊天出错:", error);
    } finally {
      // 延迟释放锁，避免快速连续的保存请求
      setTimeout(() => {
        setIsSavingChat(false); // 标记保存完成
      }, 500);
    }
  };

  // 修改加载已保存聊天的函数，确保调用新的API端点
  const loadSavedChats = async () => {
    try {
      const response = await fetch("/api/chat/list"); // 使用新的list端点

      if (!response.ok) {
        console.error("Failed to load chat list:", await response.json());
        return;
      }

      const data = await response.json();

      if (data.success && data.chats && Array.isArray(data.chats)) {
        // 强制类型转换来避免类型错误
        const typedChats = data.chats as unknown as ChatSession[];
        setChatSessions(typedChats);
      }
    } catch (error) {
      console.error("Error loading chat list:", error);
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

  // 处理选择快速提示
  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    // 不立即隐藏欢迎页面，只有在实际发送消息时才隐藏
  };

  // 当用户开始输入时，不要立即隐藏欢迎页面
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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
                userDailyUsage={userDailyUsage}
                userMaxDailyUsage={userMaxDailyUsage}
                userIsPremium={userIsPremium}
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
            {firstLoadComplete ? (
              showWelcome ? (
                <WelcomeScreen onSelectPrompt={handleSelectPrompt} />
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map(
                    (message, index) =>
                      message.role !== "system" && (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          session={session}
                        />
                      )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
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
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-3xl mx-auto flex flex-col gap-2"
            >
              <div className="relative">
                {showWelcome ? (
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="请输入您想知道的一切..."
                    className="resize-none pr-12 min-h-[80px] shadow-sm focus:shadow-md transition-shadow"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isStreaming}
                  />
                ) : (
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="resize-none pr-12 min-h-[80px] shadow-sm focus:shadow-md transition-shadow"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isStreaming}
                  />
                )}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {isStreaming ? (
                    <Button
                      type="button"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-md cursor-pointer"
                      onClick={handleStopResponse}
                      title="终止回复"
                    >
                      <Square className="h-4 w-4 text-white" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md cursor-pointer"
                      disabled={!input.trim() || isLoading}
                    >
                      <SendHorizontal className="h-4 w-4 text-white" />
                    </Button>
                  )}
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
