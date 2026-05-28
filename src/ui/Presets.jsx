import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./primitives/select";
import { PRESETS, PRESET_ORDER } from "../utils/presets";

export default function Presets({ value, onSelect }) {
  return (
    <Select value={value ?? ""} onValueChange={onSelect}>
      <SelectTrigger aria-label="Orbit preset">
        <SelectValue placeholder="Choose a preset orbit…" />
      </SelectTrigger>
      <SelectContent>
        {PRESET_ORDER.map((key) => (
          <SelectItem key={key} value={key}>
            {PRESETS[key].label} — {PRESETS[key].note}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
