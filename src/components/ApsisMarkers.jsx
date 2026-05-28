import React, { useMemo } from "react";
import { Vector3 } from "three";
import { keplerToCartesian } from "../utils/kepler";
import SceneLabel from "./SceneLabel";

const PERIGEE_COLOR = "#fb923c"; // orange — closest/fastest point
const APOGEE_COLOR = "#818cf8"; // indigo — farthest/slowest point

export default function ApsisMarkers({ a, e, i, raan, argPerigee }) {
  const { peri, apo, periLabel, apoLabel } = useMemo(() => {
    const at = (nu) => {
      const p = keplerToCartesian(a, e, i, raan, argPerigee, nu);
      return new Vector3(p.x, p.y, p.z);
    };
    const peri = at(0); // periapsis at true anomaly 0
    const apo = at(180); // apoapsis opposite
    const out = (v) => v.clone().add(v.clone().normalize().multiplyScalar(0.2)).toArray();
    return { peri, apo, periLabel: out(peri), apoLabel: out(apo) };
  }, [a, e, i, raan, argPerigee]);

  return (
    <group>
      <mesh position={peri}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshBasicMaterial color={PERIGEE_COLOR} />
      </mesh>
      <SceneLabel position={periLabel} color={PERIGEE_COLOR}>Perigee</SceneLabel>

      <mesh position={apo}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshBasicMaterial color={APOGEE_COLOR} />
      </mesh>
      <SceneLabel position={apoLabel} color={APOGEE_COLOR}>Apogee</SceneLabel>
    </group>
  );
}
