"use client";

import { LucideIcon } from "lucide-react";
import { FadeInUp } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  delay?: number;
  bgColorClass?: string;
  accentColorClass?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  delay = 0,
  bgColorClass = "from-primary/5 to-transparent",
  accentColorClass = "bg-primary/10 text-primary",
}: FeatureCardProps) {
  return (
    <FadeInUp
      className={cn(
        "group relative rounded-xl overflow-hidden backdrop-blur-sm h-full",
        "bg-card/90 hover:bg-card/60 transition-all duration-500",
        "transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-blue-900/20",
        "border-none",
        className
      )}
      delay={delay}
    >
      {/* 背景效果 */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl p-6 transition-all duration-300 h-full",
          "bg-gradient-to-br from-background to-background/80",
          "hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-blue-900/20",
          "border-none",
          bgColorClass
        )}
      >
        {/* 装饰性几何形状 */}
        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-primary/5 dark:bg-blue-900/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-primary/5 dark:bg-blue-800/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <motion.div
            className={cn(
              "mb-4 p-3 rounded-full w-fit transition-colors duration-300 dark:bg-opacity-30",
              accentColorClass.replace("text-", "group-hover:text-")
            )}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>

          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300 dark:group-hover:text-blue-400">
            {title}
          </h3>
          <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>

          {/* <div className="mt-4 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 pt-4 border-t border-primary/10 group-hover:border-primary/20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-sm flex items-center",
                accentColorClass.split(" ")[1]
              )}
            >
              了解更多
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.div>
          </div> */}
        </div>
      </div>
    </FadeInUp>
  );
}
