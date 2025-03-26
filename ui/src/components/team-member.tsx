"use client";

import { FadeInUp } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SocialLink {
  type: "github" | "linkedin" | "twitter";
  url: string;
}

interface TeamMemberProps {
  name: string;
  role: string;
  avatar?: string;
  bio: string;
  socialLinks?: SocialLink[];
  className?: string;
  delay?: number;
  colorVariant?: number;
}

export function TeamMember({
  name,
  role,
  avatar,
  bio,
  socialLinks = [],
  className,
  delay = 0,
  colorVariant = 0,
}: TeamMemberProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "github":
        return <GithubIcon className="h-4 w-4" />;
      case "linkedin":
        return <LinkedinIcon className="h-4 w-4" />;
      case "twitter":
        return <TwitterIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // 颜色变体
  const colorVariants = [
    {
      bg: "from-blue-500/5 to-transparent dark:from-blue-800/30 dark:to-blue-900/5",
      accent:
        "bg-blue-500/20 text-blue-500 border-blue-500/20 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700/30",
      highlight: "text-blue-500 dark:text-blue-400",
    },
    {
      bg: "from-violet-500/5 to-transparent dark:from-violet-800/30 dark:to-violet-900/5",
      accent:
        "bg-violet-500/20 text-violet-500 border-violet-500/20 dark:bg-violet-700/30 dark:text-violet-400 dark:border-violet-700/30",
      highlight: "text-violet-500 dark:text-violet-400",
    },
    {
      bg: "from-emerald-500/5 to-transparent dark:from-emerald-800/30 dark:to-emerald-900/5",
      accent:
        "bg-emerald-500/20 text-emerald-500 border-emerald-500/20 dark:bg-emerald-700/30 dark:text-emerald-400 dark:border-emerald-700/30",
      highlight: "text-emerald-500 dark:text-emerald-400",
    },
    {
      bg: "from-amber-500/5 to-transparent dark:from-amber-800/30 dark:to-amber-900/5",
      accent:
        "bg-amber-500/20 text-amber-500 border-amber-500/20 dark:bg-amber-700/30 dark:text-amber-400 dark:border-amber-700/30",
      highlight: "text-amber-500 dark:text-amber-400",
    },
  ];

  const selectedVariant = colorVariants[colorVariant];

  return (
    <FadeInUp
      delay={delay}
      className={cn(
        "group relative overflow-hidden flex flex-col items-center text-center p-6 rounded-xl",
        "bg-card/80 backdrop-blur-sm transition-all duration-500",
        "transform hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-blue-900/20",
        "border-none",
        className
      )}
    >
      {/* 背景效果 */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:opacity-20 dark:group-hover:opacity-100",
          selectedVariant.bg
        )}
      />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 dark:bg-blue-900/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 w-full">
        <motion.div
          className="mb-6 relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              selectedVariant.bg
            )}
          />
          <Avatar
            className={cn(
              "h-24 w-24 border-2 border-background group-hover:border-primary/20 transition-colors duration-500 relative mx-auto dark:border-gray-800",
              "group-hover:" + selectedVariant.accent
            )}
          >
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback
                className={cn(
                  "text-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-blue-800/50 dark:to-primary/30",
                  selectedVariant.highlight
                )}
              >
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>
        </motion.div>

        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 dark:group-hover:text-blue-400">
          {name}
        </h3>
        <div
          className={cn(
            "h-0.5 w-12 mx-auto my-2 bg-primary/20 group-hover:w-24 transition-all duration-500",
            "group-hover:" + selectedVariant.accent
          )}
        />
        <p className={cn("mb-3 font-medium", selectedVariant.highlight)}>
          {role}
        </p>
        <p className="text-muted-foreground mb-6 group-hover:text-foreground/80 transition-colors duration-300 text-sm">
          {bio}
        </p>

        {socialLinks.length > 0 && (
          <div className="flex gap-3 justify-center mt-auto">
            {socialLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full transition-colors duration-300 hover:bg-primary/20 dark:hover:bg-blue-800/50",
                  selectedVariant.accent.split(" ")[0],
                  selectedVariant.highlight
                )}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {getSocialIcon(link.type)}
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </FadeInUp>
  );
}
