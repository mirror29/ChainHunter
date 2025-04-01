"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/ui/logo-icon";
import { useTheme } from "next-themes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavbarProps {
  pageType?: "home" | "login" | "chat";
}

export function Navbar({ pageType = "home" }: NavbarProps) {
  const { t } = useI18n();
  const { theme, systemTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 确定当前是否是亮色模式
  const isLightMode =
    mounted &&
    (theme === "light" || (theme === "system" && systemTheme === "light"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  // 只在首页显示的导航项
  const homeNavigationItems = [
    { href: "/#home", label: t("nav.home") },
    { href: "/#features", label: t("nav.features") },
    { href: "/#roadmap", label: t("nav.roadmap") },
    { href: "/#team", label: t("nav.team") },
    { href: "/#contact", label: t("nav.contact") },
  ];

  // 根据页面类型选择导航项
  const navigationItems =
    pageType === "home" ? homeNavigationItems : [];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || pageType !== "home"
          ? "bg-background/80 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <LogoIcon width={36} height={36} lightMode={isLightMode} />
          <div className="flex items-baseline">
            <div className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600">
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
              className="dark:text-slate-200"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              Hunter
            </motion.span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-foreground/70 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/5 dark:hover:bg-blue-900/20 dark:text-slate-300 dark:hover:text-blue-400",
                index === 0 && "text-primary dark:text-blue-400"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />

          {/* 在导航栏右侧添加"开始使用"按钮，仅在主页和登录页显示（移动端） */}
          {pageType !== "chat" && (
            <Button
              className="hidden sm:flex md:hidden rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary cursor-pointer dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-700"
              size="sm"
              onClick={handleGetStarted}
            >
              {status === "authenticated"
                ? t("nav.dashboard")
                : t("nav.getStarted")}
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-900/30"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              animate={isOpen ? "open" : "closed"}
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 },
              }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <div className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600">
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
                  className="dark:text-slate-200"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  Hunter
                </motion.span>
              </div>
            </div>

            <nav className="flex-1 p-6">
              <ul className="space-y-4">
                {navigationItems.map((item) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative text-center"
                  >
                    <a
                      href={item.href}
                      className="block py-2 text-lg font-medium text-foreground hover:text-primary transition-colors dark:text-slate-200 dark:hover:text-blue-400"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                    <motion.div
                      className="absolute left-1/2 bottom-0 h-0.5 w-0 bg-primary dark:bg-blue-400"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-center gap-4 mb-4">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              {pageType !== "chat" && (
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary cursor-pointer dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-700"
                  onClick={() => {
                    handleGetStarted();
                    setIsOpen(false);
                  }}
                >
                  {status === "authenticated"
                    ? t("nav.dashboard")
                    : t("nav.getStarted")}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
