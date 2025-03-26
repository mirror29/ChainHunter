"use client";

import { FadeInRight } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface RoadmapItemProps {
  title: string;
  description: string;
  quarter: string;
  isActive?: boolean;
  className?: string;
  delay?: number;
}

export function RoadmapItem({
  title,
  description,
  quarter,
  isActive = false,
  className,
  delay = 0,
}: RoadmapItemProps) {
  const { t } = useI18n();

  return (
    <FadeInRight
      className={cn("relative pl-8 pb-8 group", className)}
      delay={delay}
    >
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-border/50 group-last:bg-transparent" />

      {/* Timeline dot with pulse animation for active item */}
      <motion.div
        className={cn(
          "absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full border-2 z-10",
          "hover:scale-150 transition-transform duration-300",
          isActive
            ? "bg-primary border-background dark:bg-blue-500 dark:border-background/80"
            : "bg-background border-primary dark:bg-background/80 dark:border-blue-500"
        )}
        whileHover={{ scale: 1.5 }}
        transition={{ duration: 0.3 }}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-primary/40 dark:bg-blue-500/40 animate-ping" />
        )}
      </motion.div>

      <div className="group-hover:translate-x-1 transition-transform duration-300">
        <div className="mb-1 text-sm font-semibold text-muted-foreground group-hover:text-primary/80 transition-colors duration-300 dark:group-hover:text-blue-400">
          {quarter}
        </div>
        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 dark:text-slate-200 dark:group-hover:text-blue-400">
          {title}
        </h3>
        <p className="mt-2 text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 dark:text-slate-400 dark:group-hover:text-slate-300">
          {description}
        </p>

        {/* 当条目被激活时显示的进度指示器 */}
        {isActive && (
          <div className="mt-3 flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/80 dark:bg-blue-500/80"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/80 dark:bg-blue-500/80"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/80 dark:bg-blue-500/80"></span>
            <span className="h-1.5 w-4 rounded-full bg-primary dark:bg-blue-500"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-border dark:bg-blue-800/50"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-border dark:bg-blue-800/50"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-border dark:bg-blue-800/50"></span>
          </div>
        )}

        {/* 悬停时出现的状态标签 */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              isActive
                ? "bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-400"
                : "bg-muted text-muted-foreground dark:bg-slate-700/50 dark:text-slate-400"
            )}
          >
            {isActive ? t("roadmap.inprogress") : t("roadmap.upcoming")}
          </span>
        </div>
      </div>
    </FadeInRight>
  );
}
