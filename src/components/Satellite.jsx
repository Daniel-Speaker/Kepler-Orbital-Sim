import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  keplerToCartesian,
  orbitalPeriod,
  velocityAtAnomaly,
  trueToMean,
  meanToTrue,
  precessionRates,
} from "../utils/kepler";

const VEL_SCALE = 0.05; // scene units per km/s

export default function Satellite({ a, e, i, raan, argPerigee, nu, playing, speed, precession, precessionBoost = 1, onPrecess, onNuChange }) {
  const meshRef = useRef();
  const arrowRef = useRef();
  const meanRef = useRef(trueToMean(nu, e)); // current mean anomaly (rad)

  // Keep mean anomaly in sync when paused / when user drags the nu slider or changes e
  useEffect(() => {
    if (!playing) meanRef.current = trueToMean(nu, e);
  }, [nu, e, playing]);

  const place = (trueAnomaly) => {
    const p = keplerToCartesian(a, e, i, raan, argPerigee, trueAnomaly);
    if (meshRef.current) meshRef.current.position.set(p.x, p.y, p.z);

    // velocity direction: finite-difference tangent in direction of increasing nu
    const d = 0.5;
    const p2 = keplerToCartesian(a, e, i, raan, argPerigee, trueAnomaly + d);
    const dir = new THREE.Vector3(p2.x - p.x, p2.y - p.y, p2.z - p.z).normalize();
    const speedKms = velocityAtAnomaly(a, e, trueAnomaly);
    if (arrowRef.current) {
      arrowRef.current.position.set(p.x, p.y, p.z);
      arrowRef.current.setDirection(dir);
      arrowRef.current.setLength(Math.max(0.15, speedKms * VEL_SCALE), 0.08, 0.05);
    }
  };

  useFrame((_, delta) => {
    if (playing) {
      const T = orbitalPeriod(a); // seconds
      const n = (2 * Math.PI) / T; // mean motion rad/s
      meanRef.current += n * delta * speed;
      meanRef.current %= 2 * Math.PI;
      const newNu = meanToTrue(meanRef.current, e);
      place(newNu);
      if (onNuChange) onNuChange(newNu);

      // J2 precession: drift the orbit plane (RAAN) and ellipse (arg. of
      // periapsis) at the same time-acceleration as the orbital motion.
      if (precession && onPrecess) {
        const { raanDot, argDot } = precessionRates(a, e, i);
        const dt = delta * speed * precessionBoost; // boost exaggerates the (tiny) J2 rates
        onPrecess(raanDot * dt, argDot * dt);
      }
    } else {
      place(nu);
    }
  });

  // ArrowHelper as an imperative object
  const arrow = useRef(
    new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.3, 0xfacc15, 0.08, 0.05)
  ).current;
  arrowRef.current = arrow;

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.9} />
      </mesh>
      <primitive object={arrow} />
    </group>
  );
}
