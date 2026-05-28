import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  orbitalPeriod, velocityAtAnomaly, radiusAtAnomaly,
  periapsisDistance, apoapsisDistance, formatPeriod,
  EARTH_RADIUS_KM, GEO_RADIUS_KM,
} from "../utils/kepler";

function Stat({ label, value }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground sm:text-[10px]">{label}</span>
      <span className="tabular-nums text-xs font-medium text-foreground sm:text-sm">{value}</span>
    </div>
  );
}

export default function DataReadout({ a, e, nu }) {
  const period = orbitalPeriod(a);
  const r = radiusAtAnomaly(a, e, nu);
  const alt = r - EARTH_RADIUS_KM;
  const v = velocityAtAnomaly(a, e, nu);
  const periAlt = periapsisDistance(a, e) - EARTH_RADIUS_KM;
  const apoAlt = apoapsisDistance(a, e) - EARTH_RADIUS_KM;
  const apoRadius = apoapsisDistance(a, e);
  const exceedsGeo = apoRadius > GEO_RADIUS_KM;
  const intersectsEarth = periAlt < 0;

  const km = (x) => `${Math.round(x).toLocaleString()} km`;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 sm:gap-x-6">
        <Stat label="Period" value={formatPeriod(period)} />
        <Stat label="Altitude" value={km(alt)} />
        <Stat label="Velocity" value={`${v.toFixed(2)} km/s`} />
        <Stat label="Periapsis" value={km(periAlt)} />
        <Stat label="Apoapsis" value={km(apoAlt)} />
      </div>
      {intersectsEarth && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-red-500/50 bg-red-500/10 px-2 py-1.5 text-[10px] text-red-400 sm:gap-2 sm:px-2.5 sm:py-2 sm:text-xs">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span>Impossible orbit: periapsis is below Earth's surface — this path cuts through the planet.</span>
        </div>
      )}
      {exceedsGeo && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-2 py-1.5 text-[10px] text-warning sm:gap-2 sm:px-2.5 sm:py-2 sm:text-xs">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span>Apoapsis exceeds geostationary radius ({GEO_RADIUS_KM.toLocaleString()} km).</span>
        </div>
      )}
    </div>
  );
}
