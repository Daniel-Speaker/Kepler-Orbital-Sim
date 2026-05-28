import React from "react";
import { Html } from "@react-three/drei";

// Small floating text label anchored at a 3D point. Non-interactive.
export default function SceneLabel({ position, color = "#cbd5e1", children }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none", userSelect: "none" }}>
      <span
        style={{
          color,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
          textShadow: "0 0 4px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </Html>
  );
}
