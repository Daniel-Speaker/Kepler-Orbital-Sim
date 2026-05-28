import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import { orbitPoints } from "../utils/kepler";

export default function OrbitPath({ a, e, i, raan, argPerigee, color = "#38bdf8" }) {
  const points = useMemo(
    () => orbitPoints(a, e, i, raan, argPerigee, 256),
    [a, e, i, raan, argPerigee]
  );
  return <Line points={points} color={color} lineWidth={2} transparent opacity={0.9} />;
}
