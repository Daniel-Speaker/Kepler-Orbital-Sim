import React, { useMemo, useState, useEffect } from "react";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

// Equirectangular day map. Drop a 2:1 JPG at public/textures/earth_day.jpg
// (e.g. from solarsystemscope.com). Missing/failed loads fall back to the
// plain blue sphere, so the app still runs without the asset.
const EARTH_DAY_MAP = "/textures/earth_day.jpg";

function useOptionalTexture(url) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let active = true;
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        if (!active) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        setTexture(tex);
      },
      undefined,
      () => {} // missing asset: stay on the fallback material
    );
    return () => {
      active = false;
    };
  }, [url]);
  return texture;
}

export default function ReferenceFrame() {
  // Atmosphere glow shader-ish: additive transparent shell
  const atmoMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#3fa9ff"),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  const dayMap = useOptionalTexture(EARTH_DAY_MAP);

  return (
    <group>
      {/* Earth — textured day map when present, else a plain blue globe.
          No axial tilt: the equator stays in the XZ plane to match the ECI grid. */}
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        {/* The `key` forces a brand-new material when the map appears, so three
            recompiles the shader to actually sample the texture (assigning .map
            to an existing material would otherwise need material.needsUpdate). */}
        <meshStandardMaterial
          key={dayMap ? "earth-textured" : "earth-plain"}
          map={dayMap || null}
          color={dayMap ? "#ffffff" : "#1f6feb"}
          roughness={0.9}
          metalness={0}
          emissive={dayMap ? "#000000" : "#0a2540"}
          emissiveIntensity={dayMap ? 0 : 0.25}
        />
      </mesh>
      {/* Atmosphere */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 48, 48]} />
        <primitive object={atmoMat} attach="material" />
      </mesh>

      {/* Equatorial reference plane grid (XZ plane, north = +Y) */}
      <Grid
        args={[16, 16]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1b3a5c"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#2a557f"
        fadeDistance={22}
        fadeStrength={1.5}
        infiniteGrid={false}
        side={THREE.DoubleSide}
      />

      {/* North polar axis marker */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.05, 0.18, 16]} />
        <meshBasicMaterial color="#8b9bb4" />
      </mesh>
    </group>
  );
}
