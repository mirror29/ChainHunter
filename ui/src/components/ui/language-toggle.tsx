"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { t, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-900/30"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Globe className="h-5 w-5 text-primary dark:text-blue-400" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 border-none shadow-lg dark:shadow-blue-900/20"
      >
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className="text-center cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-900/30"
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("zh")}
          className="text-center cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-900/30"
        >
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
