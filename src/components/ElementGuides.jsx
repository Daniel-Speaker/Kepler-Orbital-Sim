import React, { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import { Vector3 } from "three";
import { keplerToCartesian } from "../utils/kepler";

const DEG = Math.PI / 180;

// Per-element colors (kept in sync with the slider eye-toggle tint).
export const GUIDE_COLORS = {
  a: "#f59e0b",
  e: "#ec4899",
  i: "#a78bfa",
  raan: "#22c55e",
  argPerigee: "#22d3ee",
  nu: "#eab308",
};

const ORIGIN = new Vector3(0, 0, 0);
const NORTH = new Vector3(0, 1, 0);
const XREF = new Vector3(1, 0, 0);

/** Points along an arc: rotate `from` about `axis` from 0 to `angleRad`. */
function arc(from, axis, angleRad, radius, segments = 64) {
  const f = from.clone().normalize();
  const ax = axis.clone().normalize();
  const pts = [];
  for (let k = 0; k <= segments; k++) {
    const ang = angleRad * (k / segments);
    pts.push(f.clone().applyAxisAngle(ax, ang).multiplyScalar(radius));
  }
  return pts;
}

/** Signed angle (rad) from a to b measured about `axis` (right-hand). */
function signedAngle(a, b, axis) {
  const cross = a.clone().cross(b);
  return Math.atan2(cross.dot(axis.clone().normalize()), a.dot(b));
}

function Label({ position, color, children }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none", userSelect: "none" }}>
      <span
        style={{
          color,
          fontSize: 13,
          fontWeight: 600,
          fontStyle: "italic",
          textShadow: "0 0 4px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </Html>
  );
}

/** A radial line from the origin out to dir*radius. */
function Spoke({ dir, radius, color, opacity = 0.5, dashed = false }) {
  const end = dir.clone().normalize().multiplyScalar(radius);
  return (
    <Line
      points={[ORIGIN, end]}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
      dashed={dashed}
      dashSize={0.08}
      gapSize={0.06}
    />
  );
}

export default function ElementGuides({ a, e, i, raan, argPerigee, nu, show }) {
  const g = useMemo(() => {
    const at = (trueAnom) => {
      const p = keplerToCartesian(a, e, i, raan, argPerigee, trueAnom);
      return new Vector3(p.x, p.y, p.z);
    };

    const periPos = at(0);
    const apoPos = at(180);
    const satPos = at(nu);
    const nodePos = at(((-argPerigee % 360) + 360) % 360); // ascending node

    const periDir = periPos.clone().normalize();
    const satDir = satPos.clone().normalize();
    const nodeDir = nodePos.clone().normalize();

    // Orbit normal (angular-momentum direction) from two successive positions,
    // so arc sweeps follow the actual direction of motion (handles retrograde).
    const h = periPos.clone().cross(at(0.5)).normalize();

    // Perpendicular-to-node vectors in the equatorial and orbital planes.
    const ePerp = NORTH.clone().cross(nodeDir).normalize();
    const oPerp = h.clone().cross(nodeDir).normalize();
    const incRad = signedAngle(ePerp, oPerp, nodeDir);

    const ellipseCenter = periPos.clone().add(apoPos).multiplyScalar(0.5);
    const secondFocus = ellipseCenter.clone().multiplyScalar(2);

    const mid = (pts) => pts[Math.floor(pts.length / 2)];

    // Arc radii nested so the wedges don't overlap.
    const raanArc = arc(XREF, NORTH, (raan % 360) * DEG, 2.4);
    const incArc = arc(ePerp, nodeDir, incRad, 1.95);
    const argArc = arc(nodeDir, h, (argPerigee % 360) * DEG, 1.6);
    const nuArc = arc(periDir, h, (((nu % 360) + 360) % 360) * DEG, 1.35);

    return {
      periPos, apoPos, satPos, nodePos, periDir, satDir, nodeDir, ePerp, oPerp,
      ellipseCenter, secondFocus,
      raanArc, incArc, argArc, nuArc,
      raanMid: mid(raanArc), incMid: mid(incArc), argMid: mid(argArc), nuMid: mid(nuArc),
      aMid: ellipseCenter.clone().add(periPos).multiplyScalar(0.5),
      eMid: ellipseCenter.clone().multiplyScalar(0.5),
    };
  }, [a, e, i, raan, argPerigee, nu]);

  const C = GUIDE_COLORS;

  return (
    <group>
      {/* Semi-major axis: the major (apse) line through the focus */}
      {show.a && (
        <group>
          <Line points={[g.periPos, g.apoPos]} color={C.a} lineWidth={2} />
          <mesh position={g.ellipseCenter}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color={C.a} />
          </mesh>
          <Label position={g.aMid} color={C.a}>a</Label>
        </group>
      )}

      {/* Eccentricity: focus->ellipse-center offset (c = a·e) + the two foci */}
      {show.e && (
        <group>
          <Line points={[ORIGIN, g.secondFocus]} color={C.e} lineWidth={1.5} dashed dashSize={0.1} gapSize={0.06} />
          <mesh position={g.ellipseCenter}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color={C.e} />
          </mesh>
          <mesh position={g.secondFocus}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={C.e} />
          </mesh>
          <Label position={g.eMid} color={C.e}>e</Label>
        </group>
      )}

      {/* RAAN: arc in the equatorial plane from the X reference to the node */}
      {show.raan && (
        <group>
          <Line points={g.raanArc} color={C.raan} lineWidth={2} />
          <Spoke dir={XREF} radius={2.4} color={C.raan} />
          <Spoke dir={g.nodeDir} radius={2.4} color={C.raan} />
          <Label position={g.raanMid.clone().multiplyScalar(1.12)} color={C.raan}>Ω</Label>
        </group>
      )}

      {/* Inclination: arc between the equatorial and orbital planes at the node */}
      {show.i && (
        <group>
          <Line points={g.incArc} color={C.i} lineWidth={2} />
          <Spoke dir={g.ePerp} radius={1.95} color={C.i} />
          <Spoke dir={g.oPerp} radius={1.95} color={C.i} />
          {/* line of nodes, the axis inclination is measured about */}
          <Line
            points={[g.nodeDir.clone().multiplyScalar(-2.6), g.nodeDir.clone().multiplyScalar(2.6)]}
            color={C.i} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.1} gapSize={0.08}
          />
          <Label position={g.incMid.clone().multiplyScalar(1.12)} color={C.i}>i</Label>
        </group>
      )}

      {/* Argument of periapsis: arc in the orbital plane from node to periapsis */}
      {show.argPerigee && (
        <group>
          <Line points={g.argArc} color={C.argPerigee} lineWidth={2} />
          <Spoke dir={g.nodeDir} radius={1.6} color={C.argPerigee} />
          <Spoke dir={g.periDir} radius={1.6} color={C.argPerigee} />
          <Label position={g.argMid.clone().multiplyScalar(1.14)} color={C.argPerigee}>ω</Label>
        </group>
      )}

      {/* True anomaly: arc in the orbital plane from periapsis to the satellite */}
      {show.nu && (
        <group>
          <Line points={g.nuArc} color={C.nu} lineWidth={2} />
          <Spoke dir={g.periDir} radius={1.35} color={C.nu} />
          <Spoke dir={g.satDir} radius={1.35} color={C.nu} />
          <Label position={g.nuMid.clone().multiplyScalar(1.16)} color={C.nu}>ν</Label>
        </group>
      )}
    </group>
  );
}
