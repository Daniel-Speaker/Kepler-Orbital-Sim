import React from "react";
import { Play, Pause, Gauge } from "lucide-react";
import { Button } from "./primitives/button";
import { Slider } from "./primitives/slider";

// speed = 10^s, s in [0,4] -> 1x .. 10,000x (log scale)
export default function Transport({ playing, onToggle, speed, onSpeed }) {
  const s = Math.log10(speed);
  const fmt =
    speed >= 100 ? Math.round(speed).toLocaleString() : speed.toFixed(speed < 10 ? 1 : 0);
  return (
    <div className="flex items-center gap-3">
      <Button
        size="icon"
        onClick={onToggle}
        aria-label={playing ? "Pause animation" : "Play animation"}
        className="shrink-0"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <div className="flex flex-1 items-center gap-2">
        <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Slider
          aria-label="Animation speed"
          value={[s]}
          min={0}
          max={4}
          step={0.01}
          onValueChange={(v) => onSpeed(Math.pow(10, v[0]))}
        />
        <span className="w-20 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{fmt}×</span>
      </div>
    </div>
  );
}
