import React, { useState } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Copies the current page URL (which mirrors the orbit state) to the clipboard.
export default function ShareLink({ className }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      return; // clipboard blocked (e.g. insecure context) — fail quietly
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-primary" /> Link copied
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" /> Copy share link
        </>
      )}
    </button>
  );
}
