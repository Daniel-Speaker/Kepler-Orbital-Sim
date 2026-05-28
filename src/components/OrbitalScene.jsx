import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ReferenceFrame from "./ReferenceFrame";
import OrbitPath from "./OrbitPath";
import GhostOrbit from "./GhostOrbit";
import Satellite from "./Satellite";
import NodeMarkers from "./NodeMarkers";
import ApsisMarkers from "./ApsisMarkers";
import ElementGuides from "./ElementGuides";

export default function OrbitalScene({ params, playing, speed, precession, precessionBoost, onPrecess, onNuChange, ghost, viz, showApsides }) {
  const { a, e, i, raan, argPerigee, nu } = params;
  return (
    <Canvas
      camera={{ position: [6, 4, 6], fov: 50, near: 0.01, far: 1000 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#05070f"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 6, 8]} intensity={1.0} color="#fff6e8" />
      <Stars radius={120} depth={50} count={2500} factor={3} fade speed={0.5} />

      <ReferenceFrame />
      <OrbitPath a={a} e={e} i={i} raan={raan} argPerigee={argPerigee} />
      <GhostOrbit points={ghost.points} triggerId={ghost.id} />
      <NodeMarkers a={a} e={e} i={i} raan={raan} argPerigee={argPerigee} />
      {showApsides && (
        <ApsisMarkers a={a} e={e} i={i} raan={raan} argPerigee={argPerigee} />
      )}
      {viz && (
        <ElementGuides a={a} e={e} i={i} raan={raan} argPerigee={argPerigee} nu={nu} show={viz} />
      )}
      <Satellite
        a={a} e={e} i={i} raan={raan} argPerigee={argPerigee} nu={nu}
        playing={playing} speed={speed}
        precession={precession} precessionBoost={precessionBoost} onPrecess={onPrecess} onNuChange={onNuChange}
      />

      <OrbitControls enablePan={false} minDistance={1.6} maxDistance={60} makeDefault />
    </Canvas>
  );
}
