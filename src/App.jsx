import React, { useState, useRef, useEffect, useCallback } from "react";
import { Maximize2 } from "lucide-react";
import { TooltipProvider } from "./ui/primitives/tooltip";
import OrbitalScene from "./components/OrbitalScene";
import GroundTrack from "./components/GroundTrack";
import ControlPanel from "./ui/ControlPanel";
import Transport from "./ui/Transport";
import DataReadout from "./ui/DataReadout";
import { orbitPoints, maxEccentricityFor, minSemiMajorFor } from "./utils/kepler";
import { PRESETS } from "./utils/presets";
import { DEFAULTS, parseUrlState, serializeUrlState, matchPreset } from "./utils/urlState";

const wrap360 = (deg) => ((deg % 360) + 360) % 360;
const INITIAL = parseUrlState(); // shareable state from the URL, if present

// CSS for a view: fills the preview when primary, a corner inset when not (and
// PiP is enabled), or hidden. Both views stay mounted regardless.
const PIP_CLS =
  "absolute bottom-3 left-3 z-20 w-[clamp(150px,28%,280px)] aspect-[3/2] overflow-hidden rounded-lg border border-border bg-card shadow-xl";
function viewWrapperCls(isPrimary, showPip) {
  if (isPrimary) return "absolute inset-0";
  return showPip ? PIP_CLS : "hidden";
}

// Transparent click layer over the inset view; clicking it swaps to that view.
function PipOverlay({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${label}`}
      className="group absolute inset-0 z-10 flex items-start justify-end p-1 focus:outline-none"
    >
      <span className="flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90 transition-colors group-hover:bg-black/75">
        <Maximize2 className="h-3 w-3" />
        {label}
      </span>
    </button>
  );
}

export default function App() {
  const [params, setParams] = useState(INITIAL?.params ?? DEFAULTS);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [presetKey, setPresetKey] = useState(() =>
    INITIAL ? matchPreset(INITIAL.params) : "ISS"
  );
  const [ghost, setGhost] = useState({ points: null, id: 0 });
  const [precession, setPrecession] = useState(INITIAL?.precession ?? false);
  const [precessionBoost, setPrecessionBoost] = useState(INITIAL?.precessionBoost ?? 50); // visual exaggeration of J2 rates
  const [enforcePhysical, setEnforcePhysical] = useState(INITIAL?.enforcePhysical ?? false);
  const [showApsides, setShowApsides] = useState(INITIAL?.showApsides ?? true);
  const [primaryView, setPrimaryView] = useState(INITIAL?.primaryView ?? "3d"); // which view fills the screen
  const [showPip, setShowPip] = useState(INITIAL?.showPip ?? true); // show the other view as a corner inset
  const [trackOrbits, setTrackOrbits] = useState(INITIAL?.trackOrbits ?? 2);
  const [simTime, setSimTime] = useState(0); // elapsed simulated seconds (for ground-track Earth rotation)
  // Which elements have their angle/axis drawn in the 3D scene.
  const [viz, setViz] = useState(INITIAL?.viz ?? { a: false, e: false, i: false, raan: false, argPerigee: false, nu: false });

  const prevShape = useRef({ a: params.a, e: params.e, i: params.i, raan: params.raan, argPerigee: params.argPerigee });
  const mounted = useRef(false);
  // Track playback in a ref so the ghost effect can ignore precession-driven
  // RAAN/argPerigee updates (which happen continuously during playback).
  const playingRef = useRef(playing);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Ghost orbit: when a shape/orientation param changes via a manual edit,
  // snapshot the PREVIOUS orbit. Skip during playback so precession doesn't
  // spawn a ghost every frame.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevShape.current = { a: params.a, e: params.e, i: params.i, raan: params.raan, argPerigee: params.argPerigee };
      return;
    }
    const p = prevShape.current;
    if (!playingRef.current) {
      setGhost((g) => ({ points: orbitPoints(p.a, p.e, p.i, p.raan, p.argPerigee, 128), id: g.id + 1 }));
    }
    prevShape.current = { a: params.a, e: params.e, i: params.i, raan: params.raan, argPerigee: params.argPerigee };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.a, params.e, params.i, params.raan, params.argPerigee]);

  const setParam = useCallback((key, value) => {
    setParams((p) => {
      let v = value;
      // Keep periapsis above the minimum altitude when physical orbits are enforced.
      if (enforcePhysical) {
        if (key === "e") v = Math.min(v, maxEccentricityFor(p.a));
        else if (key === "a") v = Math.max(v, minSemiMajorFor(p.e));
      }
      return { ...p, [key]: v };
    });
    if (key !== "nu") setPresetKey(null); // editing shape => no longer a named preset
  }, [enforcePhysical]);

  // Satellite reports its true anomaly during playback (does not clear preset / ghost)
  const onNuChange = useCallback((newNu) => {
    setParams((p) => ({ ...p, nu: newNu }));
  }, []);

  // Satellite reports elapsed simulated time, used for the ground track's
  // Earth-rotation phase so the track drifts correctly over successive orbits.
  const onTime = useCallback((t) => setSimTime(t), []);

  // J2 precession: drift the line of nodes (RAAN) and the ellipse (arg. of
  // periapsis) directly into the elements, so the sliders track the drift the
  // same way the true-anomaly slider tracks the satellite.
  const onPrecess = useCallback((dRaan, dArg) => {
    setParams((p) => ({
      ...p,
      raan: wrap360(p.raan + dRaan),
      argPerigee: wrap360(p.argPerigee + dArg),
    }));
  }, []);

  const onPreset = useCallback((key) => {
    const pr = PRESETS[key];
    if (!pr) return;
    setParams({ a: pr.a, e: pr.e, i: pr.i, raan: pr.raan, argPerigee: pr.argPerigee, nu: pr.nu });
    setPresetKey(key);
  }, []);

  const onTogglePrecession = useCallback((next) => {
    setPrecession(next);
  }, []);

  const onVizToggle = useCallback((key, value) => {
    setViz((v) => ({ ...v, [key]: value }));
  }, []);

  const onToggleApsides = useCallback((next) => {
    setShowApsides(next);
  }, []);

  const onTogglePip = useCallback((next) => {
    setShowPip(next);
  }, []);

  const swapViews = useCallback(() => {
    setPrimaryView((v) => (v === "3d" ? "ground" : "3d"));
  }, []);

  // Mirror the current state into the URL (debounced). The debounce naturally
  // skips the per-frame churn during playback — it only writes ~0.4s after
  // motion/edits stop, capturing the resting state for a shareable link.
  useEffect(() => {
    const id = setTimeout(() => {
      const qs = serializeUrlState({
        params, precession, precessionBoost, enforcePhysical, showApsides, primaryView, showPip, trackOrbits, viz,
      });
      window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
    }, 400);
    return () => clearTimeout(id);
  }, [params, precession, precessionBoost, enforcePhysical, showApsides, primaryView, showPip, trackOrbits, viz]);

  const onToggleEnforce = useCallback((next) => {
    setEnforcePhysical(next);
    if (next) {
      // Pull a currently-impossible orbit back to its minimum-altitude limit.
      setParams((p) => {
        const maxE = maxEccentricityFor(p.a);
        return p.e > maxE ? { ...p, e: maxE } : p;
      });
    }
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full w-full flex-col md:flex-row">
        {/* Preview: 3D scene and ground track, swappable (click the inset to swap) */}
        <div className="relative h-[55vh] w-full md:h-full md:flex-1">
          {/* 3D — always mounted (swapping only changes CSS, never remounts the Canvas) */}
          <div className={viewWrapperCls(primaryView === "3d", showPip)}>
            <OrbitalScene
              params={params}
              playing={playing}
              speed={speed}
              precession={precession}
              precessionBoost={precessionBoost}
              onPrecess={onPrecess}
              onNuChange={onNuChange}
              onTime={onTime}
              ghost={ghost}
              viz={viz}
              showApsides={showApsides}
              interactive={primaryView === "3d"}
            />
            {primaryView !== "3d" && <PipOverlay label="3D view" onClick={swapViews} />}
          </div>

          {/* Ground track — always mounted */}
          <div className={viewWrapperCls(primaryView === "ground", showPip)}>
            <GroundTrack
              a={params.a} e={params.e} i={params.i}
              raan={params.raan} argPerigee={params.argPerigee} nu={params.nu}
              orbits={trackOrbits} epoch={simTime}
            />
            {primaryView !== "ground" && <PipOverlay label="Ground track" onClick={swapViews} />}
          </div>

          {/* Live orbital data as a full-width bar across the top of the preview */}
          <div className="pointer-events-none absolute left-2 right-2 top-2 z-30 rounded-md border border-border bg-card/80 px-3 py-2 shadow-lg backdrop-blur sm:left-4 sm:right-4 sm:top-4 sm:rounded-lg">
            <DataReadout a={params.a} e={params.e} nu={params.nu} />
          </div>
        </div>

        {/* Control panel: sidebar on desktop, sheet below on mobile */}
        <aside className="flex min-h-0 flex-1 flex-col border-t border-border bg-card md:h-full md:w-[340px] md:flex-none md:border-l md:border-t-0">
          <div className="panel-scroll flex-1 overflow-y-auto p-4 pb-2">
            <ControlPanel
              params={params}
              setParam={setParam}
              presetKey={presetKey}
              onPreset={onPreset}
              precession={precession}
              onTogglePrecession={onTogglePrecession}
              precessionBoost={precessionBoost}
              onPrecessionBoost={setPrecessionBoost}
              enforcePhysical={enforcePhysical}
              onToggleEnforce={onToggleEnforce}
              viz={viz}
              onVizToggle={onVizToggle}
              showApsides={showApsides}
              onToggleApsides={onToggleApsides}
              primaryView={primaryView}
              showPip={showPip}
              onTogglePip={onTogglePip}
              trackOrbits={trackOrbits}
              onTrackOrbits={setTrackOrbits}
            />
          </div>
          {/* Transport pinned to bottom, thumb-accessible */}
          <div className="sticky bottom-0 border-t border-border bg-card/95 p-3 backdrop-blur">
            <Transport
              playing={playing}
              onToggle={() => setPlaying((v) => !v)}
              speed={speed}
              onSpeed={setSpeed}
            />
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
}
