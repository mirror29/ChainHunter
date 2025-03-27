import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="relative w-full rounded-md bg-zinc-900 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-400 dark:text-zinc-400">
        <span>{language || "plain text"}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
          onClick={onCopy}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm",
          language && "language-" + language
        )}
      >
        <code className={cn("block", language && "language-" + language)}>
          {value}
        </code>
      </pre>
    </div>
  );
}
