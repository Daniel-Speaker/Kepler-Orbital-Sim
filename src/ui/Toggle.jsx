import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./primitives/tooltip";
import { cn } from "@/lib/utils";

/**
 * A labeled on/off switch row. `tip` (optional) shows on hover/focus of the label.
 */
export default function Toggle({ checked, onChange, label, tip }) {
  const labelEl = (
    <span className="text-sm text-foreground/90">{label}</span>
  );
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      {tip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="cursor-help text-left underline decoration-dotted decoration-muted-foreground/50 underline-offset-2">
              {labelEl}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px]">{tip}</TooltipContent>
        </Tooltip>
      ) : (
        labelEl
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
