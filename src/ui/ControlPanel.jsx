import React from "react";
import ParamSlider from "./ParamSlider";
import Presets from "./Presets";
import Toggle from "./Toggle";
import ShareLink from "./ShareLink";
import { GUIDE_COLORS } from "../components/ElementGuides";

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/80">{title}</h3>
      {children}
    </div>
  );
}

export default function ControlPanel({
  params,
  setParam,
  presetKey,
  onPreset,
  precession,
  onTogglePrecession,
  precessionBoost,
  onPrecessionBoost,
  enforcePhysical,
  onToggleEnforce,
  viz,
  onVizToggle,
  showApsides,
  onToggleApsides,
  primaryView,
  showPip,
  onTogglePip,
  trackOrbits,
  onTrackOrbits,
}) {
  // Ground track is on screen if it's the main view, or shown as the inset.
  const groundTrackVisible = primaryView === "ground" || showPip;
  const { a, e, i, raan, argPerigee, nu } = params;
  // Shared props that wire a slider's eye-toggle to its 3D guide.
  const vizProps = (key) => ({
    vizChecked: viz?.[key],
    vizColor: GUIDE_COLORS[key],
    onVizToggle: (v) => onVizToggle?.(key, v),
  });
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preset orbit</label>
        <Presets value={presetKey} onSelect={onPreset} />
        <ShareLink className="mt-2" />
      </div>

      <Section title="Shape">
        <ParamSlider label="Semi-major axis" symbol="a" value={a} min={6571} max={42164} step={1}
          unit="km" onChange={(v) => setParam("a", v)} format={(x) => Math.round(x).toLocaleString()}
          tip="Semi-major axis — the orbit's overall size (half the longest diameter). Larger = higher, slower orbit."
          {...vizProps("a")} />
        <ParamSlider label="Eccentricity" symbol="e" value={e} min={0} max={0.9} step={0.0001}
          onChange={(v) => setParam("e", v)} format={(x) => x.toFixed(4)}
          tip="Eccentricity — how stretched the orbit is. 0 = perfect circle; closer to 1 = a long, thin ellipse."
          {...vizProps("e")} />
      </Section>

      <Section title="Orientation">
        <ParamSlider label="Inclination" symbol="i" value={i} min={0} max={180} step={0.1}
          unit="°" onChange={(v) => setParam("i", v)} format={(x) => x.toFixed(1)}
          tip="Inclination — the tilt of the orbit relative to Earth's equator. 0° = equatorial, 90° = polar, >90° = retrograde."
          {...vizProps("i")} />
        <ParamSlider label="RAAN" symbol="Ω" value={raan} min={0} max={360} step={0.5}
          unit="°" onChange={(v) => setParam("raan", v)} format={(x) => x.toFixed(0)}
          tip="Right Ascension of the Ascending Node — swivels the whole orbit around Earth's axis, setting where it crosses the equator going north."
          {...vizProps("raan")} />
        <ParamSlider label="Arg. of periapsis" symbol="ω" value={argPerigee} min={0} max={360} step={0.5}
          unit="°" onChange={(v) => setParam("argPerigee", v)} format={(x) => x.toFixed(0)}
          tip="Argument of periapsis — rotates the ellipse within its own plane, setting where the lowest point (periapsis) sits."
          {...vizProps("argPerigee")} />
      </Section>

      <Section title="Position">
        <ParamSlider label="True anomaly" symbol="ν" value={nu} min={0} max={360} step={0.5}
          unit="°" onChange={(v) => setParam("nu", v)} format={(x) => x.toFixed(0)}
          tip="True anomaly — where the satellite currently is along its orbit, measured from periapsis. Tracks the satellite during playback."
          {...vizProps("nu")} />
      </Section>

      <Section title="Dynamics">
        <Toggle
          checked={!!showApsides}
          onChange={onToggleApsides}
          label="Perigee & apogee markers"
          tip="Show the lowest point (perigee, orange) and highest point (apogee, indigo) of the orbit. Most meaningful for eccentric orbits — on a circular orbit every point is at the same altitude."
        />
        <Toggle
          checked={!!showPip}
          onChange={onTogglePip}
          label="Picture-in-picture"
          tip="Shows the other view (3D scene or ground track) as a small inset you can click to swap to fullscreen. Turn off to show only the main view."
        />
        {groundTrackVisible && (
          <ParamSlider label="Trailing orbits" value={trackOrbits} min={1} max={80} step={1}
            onChange={onTrackOrbits} format={(x) => Math.round(x).toString()}
            tip="How many past orbits of ground track to draw behind the satellite. More orbits show the westward drift building up over time." />
        )}
        <Toggle
          checked={!!precession}
          onChange={onTogglePrecession}
          label="J2 precession"
          tip="Models Earth's oblateness (J2): the line of nodes (RAAN) and the ellipse (argument of periapsis) slowly drift. The drift advances during playback and the RAAN / ω sliders track it — crank up the speed to see it."
        />
        {precession && (
          <ParamSlider label="Precession boost" value={precessionBoost} min={1} max={500} step={1}
            unit="×" onChange={onPrecessionBoost} format={(x) => Math.round(x).toLocaleString()}
            tip="Exaggerates the (very slow) real J2 precession rates so the drift is visible without maxing out playback speed. 1× = physically accurate; higher = sped-up for demonstration." />
        )}
        <Toggle
          checked={!!enforcePhysical}
          onChange={onToggleEnforce}
          label="Enforce physical orbits"
          tip="Keeps the periapsis at least 150 km up so the orbit clears the atmosphere instead of cutting through the planet. Limits how high eccentricity (or how low the semi-major axis) can go."
        />
      </Section>
    </div>
  );
}
