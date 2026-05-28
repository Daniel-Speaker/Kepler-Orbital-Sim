import React from "react";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import { Slider } from "./primitives/slider";
import { Tooltip, TooltipTrigger, TooltipContent } from "./primitives/tooltip";
import { cn } from "@/lib/utils";

export default function ParamSlider({
  label, symbol, value, min, max, step, unit, tip, onChange, format,
  vizChecked, onVizToggle, vizColor,
}) {
  const display = format ? format(value) : value;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground">
          <span className="font-medium">{label}</span>
          {symbol && <span className="italic text-muted-foreground">{symbol}</span>}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Help: ${label}`}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
          </Tooltip>
          {onVizToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={!!vizChecked}
                  aria-label={`Visualize ${label} in the 3D view`}
                  onClick={() => onVizToggle(!vizChecked)}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={vizChecked && vizColor ? { color: vizColor } : undefined}
                >
                  {vizChecked ? (
                    <Eye className={cn("h-3.5 w-3.5", !vizColor && "text-primary")} />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Show this {symbol ? `(${symbol}) ` : ""}angle/axis in the 3D view</TooltipContent>
            </Tooltip>
          )}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {display}
          {unit && <span className="ml-0.5">{unit}</span>}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
