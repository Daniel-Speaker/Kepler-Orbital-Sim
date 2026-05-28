import React, { useMemo } from "react";
import { Vector3 } from "three";
import { keplerToCartesian } from "../utils/kepler";
import SceneLabel from "./SceneLabel";

const ASC_COLOR = "#22c55e";
const DESC_COLOR = "#f43f5e";

export default function NodeMarkers({ a, e, i, raan, argPerigee }) {
  // Ascending node: argument of latitude u = argPerigee + nu = 0  -> nu = -argPerigee
  // Descending node: u = 180 -> nu = 180 - argPerigee
  const { asc, desc, ascLabel, descLabel } = useMemo(() => {
    const nuAsc = ((-argPerigee % 360) + 360) % 360;
    const nuDesc = (((180 - argPerigee) % 360) + 360) % 360;
    const at = (nu) => {
      const p = keplerToCartesian(a, e, i, raan, argPerigee, nu);
      return new Vector3(p.x, p.y, p.z);
    };
    const asc = at(nuAsc);
    const desc = at(nuDesc);
    const out = (v) => v.clone().add(v.clone().normalize().multiplyScalar(0.2)).toArray();
    return { asc, desc, ascLabel: out(asc), descLabel: out(desc) };
  }, [a, e, i, raan, argPerigee]);

  // Nodes are undefined for an equatorial orbit (the orbit never leaves the
  // equatorial plane), so only show them for inclined orbits.
  if (i < 0.5 || i > 179.5) return null;

  return (
    <group>
      <mesh position={asc}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={ASC_COLOR} />
      </mesh>
      <SceneLabel position={ascLabel} color={ASC_COLOR}>Asc. node</SceneLabel>

      <mesh position={desc}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={DESC_COLOR} />
      </mesh>
      <SceneLabel position={descLabel} color={DESC_COLOR}>Desc. node</SceneLabel>
    </group>
  );
}
