import { motion } from "framer-motion";
import { LogoIcon } from "./logo-icon";

export interface ChainHunterLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  showAI?: boolean;
  lightMode?: boolean;
}

export function ChainHunterLogo({
  className = "",
  size = "md",
  showIcon = true,
  showAI = false,
  lightMode = false
}: ChainHunterLogoProps) {

  // 基于尺寸大小设置样式
  const sizeClasses = {
    sm: {
      container: "gap-1",
      icon: { width: 24, height: 24 },
      text: "text-xl",
      underline: "h-0.5",
      aiSpacing: "ml-2"
    },
    md: {
      container: "gap-2",
      icon: { width: 32, height: 32 },
      text: "text-2xl",
      underline: "h-0.5",
      aiSpacing: "ml-3"
    },
    lg: {
      container: "gap-2",
      icon: { width: 36, height: 36 },
      text: "text-3xl",
      underline: "h-0.5",
      aiSpacing: "ml-3"
    },
    xl: {
      container: "gap-3",
      icon: { width: 48, height: 48 },
      text: "text-4xl",
      underline: "h-1",
      aiSpacing: "ml-3"
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`flex items-center ${current.container} ${className}`}>
      {showIcon && (
        <LogoIcon
          width={current.icon.width}
          height={current.icon.height}
          lightMode={lightMode}
        />
      )}

      <div className="flex items-baseline">
        <div className="relative">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600 font-bold ${current.text}`}>
            Chain
          </span>
          <motion.div
            className={`absolute -bottom-1 left-0 ${current.underline} w-0 bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600`}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              ease: "easeOut",
            }}
          />
        </div>
        <motion.span
          className={`dark:text-slate-200 font-bold ${current.text}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Hunter
        </motion.span>

        {showAI && (
          <motion.span
            className={`dark:text-slate-200 font-bold ${current.text} ${current.aiSpacing}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            AI
          </motion.span>
        )}
      </div>
    </div>
  );
}
