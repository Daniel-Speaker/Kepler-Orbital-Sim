import React, { useMemo } from "react";
import {
  keplerToCartesian,
  orbitalPeriod,
  meanToTrue,
  trueToMean,
} from "../utils/kepler";

const DEG = Math.PI / 180;
const SIDEREAL_DAY = 86164.0905; // seconds — Earth's rotation period (inertial)
const DEFAULT_PERIODS = 2; // how many orbits of trailing track to draw

// Recover Earth-centered inertial coords from keplerToCartesian's scene output
// (scene = [x_eci, z_eci(north), -y_eci]).
function eciAt(a, e, i, raan, argPerigee, nu) {
  const p = keplerToCartesian(a, e, i, raan, argPerigee, nu);
  return { x: p.x, y: -p.z, z: p.y };
}

// Sub-satellite latitude/longitude. Longitude accounts for Earth's rotation
// (GMST grows with time); the absolute longitude origin is arbitrary since the
// sim has no real epoch — the shape and westward drift are what matter.
function latLon(eci, tSec) {
  const r = Math.hypot(eci.x, eci.y, eci.z);
  const s = Math.max(-1, Math.min(1, eci.z / r)); // clamp guards asin against rounding past ±1
  const lat = Math.asin(s) / DEG;
  const raDeg = Math.atan2(eci.y, eci.x) / DEG;
  const gmstDeg = (tSec / SIDEREAL_DAY) * 360;
  const lon = (((raDeg - gmstDeg + 180) % 360) + 360) % 360 - 180;
  return { lat, lon };
}

const X = (lon) => lon + 180; // [-180,180] -> [0,360]
const Y = (lat) => 90 - lat; //  [90,-90]  -> [0,180]
const toPath = (seg) =>
  seg.map((p, k) => `${k ? "L" : "M"}${X(p.lon).toFixed(2)} ${Y(p.lat).toFixed(2)}`).join(" ");

export default function GroundTrack({ a, e, i, raan, argPerigee, nu, orbits = DEFAULT_PERIODS, epoch = 0 }) {
  // A trailing ground track over the last `orbits` orbits, ending at the current
  // satellite position. `epoch` is the elapsed simulated time: feeding it into
  // the Earth-rotation (GMST) term makes the track drift west over successive
  // orbits during playback, while the marker still rides the head of the trail.
  const { segments, marker } = useMemo(() => {
    const T = orbitalPeriod(a);
    const n = (2 * Math.PI) / T;
    const m0 = trueToMean(nu, e); // current mean anomaly (rad)
    const span = orbits * T;
    const K = Math.min(3600, Math.round(120 * orbits)); // ~120 samples/orbit, capped for perf
    const pts = [];
    for (let k = 0; k <= K; k++) {
      const tau = epoch - span + span * (k / K); // absolute sim-time in [epoch - span, epoch]
      const trueAnom = meanToTrue(m0 + n * (tau - epoch), e);
      pts.push(latLon(eciAt(a, e, i, raan, argPerigee, trueAnom), tau));
    }
    // Split at antimeridian (±180°) wraps so segments don't streak across the map.
    const segs = [];
    let cur = [];
    for (let k = 0; k < pts.length; k++) {
      if (k > 0 && Math.abs(pts[k].lon - pts[k - 1].lon) > 180) {
        segs.push(cur);
        cur = [];
      }
      cur.push(pts[k]);
    }
    if (cur.length) segs.push(cur);
    return { segments: segs, marker: pts[pts.length - 1] }; // marker = head of trail (now)
  }, [a, e, i, raan, argPerigee, nu, orbits, epoch]);

  // Fills its container; the parent decides the size (large view vs PiP).
  return (
    <div className="h-full w-full bg-[#0a1020]">
      <svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
        <rect x="0" y="0" width="360" height="180" fill="#0a1020" />
        <image
          href="/textures/earth_day.jpg"
          x="0" y="0" width="360" height="180"
          preserveAspectRatio="none" opacity="0.8"
        />
        {/* equator + prime meridian reference lines */}
        <line x1="0" y1="90" x2="360" y2="90" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.5" />
        <line x1="180" y1="0" x2="180" y2="180" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="0.5" />
        {segments.map((seg, idx) => (
          <path key={idx} d={toPath(seg)} fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.95" />
        ))}
        <circle cx={X(marker.lon)} cy={Y(marker.lat)} r="3" fill="#fde047" stroke="#000" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
