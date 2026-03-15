"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = "typescript", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/30">
          <span className="font-mono text-xs text-muted-foreground">{title}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{language}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-muted/50 transition-colors"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-score-green" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      )}
      {!title && (
        <div className="flex justify-end px-4 py-1.5 bg-muted/30 border-b border-border/30">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-score-green" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto bg-card">
        <pre className="font-mono text-xs text-foreground leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
