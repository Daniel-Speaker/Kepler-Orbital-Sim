import React, { useRef, useEffect, useState } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function GhostOrbit({ points, triggerId }) {
  const ref = useRef();
  const start = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerId > 0 && points && points.length > 1) {
      start.current = performance.now();
      setVisible(true);
    }
  }, [triggerId, points]);

  useFrame(() => {
    if (!visible || !ref.current) return;
    const t = (performance.now() - start.current) / 2000; // 2s fade
    if (t >= 1) {
      setVisible(false);
      return;
    }
    const op = 0.45 * (1 - t);
    if (ref.current.material) ref.current.material.opacity = op;
  });

  if (!visible || !points || points.length < 2) return null;
  return (
    <Line
      ref={ref}
      points={points}
      color="#64748b"
      lineWidth={1.5}
      dashed
      dashSize={0.15}
      gapSize={0.1}
      transparent
      opacity={0.45}
    />
  );
}
