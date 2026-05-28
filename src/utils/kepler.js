import { Vector3 } from "three";

// --- Physical constants ---
export const MU = 3.986e14;            // Earth's gravitational parameter, m^3 / s^2
export const EARTH_RADIUS_KM = 6371;   // mean Earth radius, km
export const EARTH_EQ_RADIUS_KM = 6378.137; // equatorial radius (used for J2), km
export const GEO_RADIUS_KM = 42164;    // geostationary orbital radius, km
export const J2 = 1.08263e-3;          // Earth's second zonal harmonic (oblateness)
export const MIN_ALTITUDE_KM = 150;    // minimum periapsis altitude for a "physical" orbit, km
export const MIN_PERIAPSIS_KM = EARTH_RADIUS_KM + MIN_ALTITUDE_KM; // floor for periapsis radius
export const SCENE_SCALE = 1 / EARTH_RADIUS_KM; // km -> Three.js scene units (Earth radius = 1.0)

const DEG = Math.PI / 180;

/**
 * Orbital radius (km) at a given true anomaly, from the conic equation.
 */
export function radiusAtAnomaly(a, e, trueAnomalyDeg) {
  const nu = trueAnomalyDeg * DEG;
  return (a * (1 - e * e)) / (1 + e * Math.cos(nu));
}

/**
 * Convert Keplerian elements to a Cartesian position in an Earth-centered
 * frame, returned in Three.js scene units with Y as the celestial north axis.
 * Angles in degrees, a in km.
 *
 * Perifocal -> ECI rotation is the standard 3-1-3 sequence Rz(RAAN)Rx(i)Rz(argP).
 * We then map ECI (x, y, z[north]) -> scene (x, z[north -> +Y], -y). Negating the
 * last component keeps this a proper right-handed rotation (not a reflection), so
 * prograde orbits circulate the correct way and inclination tilts intuitively.
 */
export function keplerToCartesian(a, e, i, raan, argPerigee, trueAnomaly) {
  const r = radiusAtAnomaly(a, e, trueAnomaly);
  const nu = trueAnomaly * DEG;

  // Position in the perifocal (PQW) frame, km
  const xp = r * Math.cos(nu);
  const yp = r * Math.sin(nu);

  const o = argPerigee * DEG;
  const I = i * DEG;
  const O = raan * DEG;

  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosI = Math.cos(I), sinI = Math.sin(I);
  const coso = Math.cos(o), sino = Math.sin(o);

  // Rotation matrix rows (PQW -> ECI), zp component is 0 so only first two cols used
  const r11 = cosO * coso - sinO * sino * cosI;
  const r12 = -cosO * sino - sinO * coso * cosI;
  const r21 = sinO * coso + cosO * sino * cosI;
  const r22 = -sinO * sino + cosO * coso * cosI;
  const r31 = sino * sinI;
  const r32 = coso * sinI;

  const xEci = r11 * xp + r12 * yp; // equatorial plane
  const yEci = r21 * xp + r22 * yp; // equatorial plane
  const zEci = r31 * xp + r32 * yp; // toward north pole

  // Map to Three.js (Y up = north), scaled to scene units.
  // (x, z, -y) is a proper rotation — preserves orbital handedness/direction.
  return {
    x: xEci * SCENE_SCALE,
    y: zEci * SCENE_SCALE,
    z: -yEci * SCENE_SCALE,
  };
}

/**
 * Sample the full orbit ellipse, returning an array of THREE.Vector3 in scene units.
 * Does not depend on true anomaly.
 */
export function orbitPoints(a, e, i, raan, argPerigee, numPoints = 256) {
  const pts = [];
  for (let k = 0; k <= numPoints; k++) {
    const nu = (360 * k) / numPoints;
    const p = keplerToCartesian(a, e, i, raan, argPerigee, nu);
    pts.push(new Vector3(p.x, p.y, p.z));
  }
  return pts;
}

/** Orbital period in seconds (Kepler's third law). a in km. */
export function orbitalPeriod(a) {
  const aM = a * 1000;
  return 2 * Math.PI * Math.sqrt((aM * aM * aM) / MU);
}

/** Speed in km/s at a true anomaly, via the vis-viva equation. a in km. */
export function velocityAtAnomaly(a, e, trueAnomaly) {
  const rM = radiusAtAnomaly(a, e, trueAnomaly) * 1000;
  const aM = a * 1000;
  const vMs = Math.sqrt(MU * (2 / rM - 1 / aM));
  return vMs / 1000;
}

/**
 * J2 secular precession rates for RAAN (regression of nodes) and argument of
 * periapsis, returned in degrees per second. Driven by Earth's oblateness.
 *   dΩ/dt = -3/2 · n · J2 · (Re/p)² · cos i
 *   dω/dt =  3/4 · n · J2 · (Re/p)² · (5cos²i − 1)
 * a in km, i in degrees.
 */
export function precessionRates(a, e, iDeg) {
  const aM = a * 1000;
  const n = Math.sqrt(MU / (aM * aM * aM)); // mean motion, rad/s
  const p = a * (1 - e * e);                // semi-latus rectum, km
  const reOverP = EARTH_EQ_RADIUS_KM / p;
  const factor = n * J2 * reOverP * reOverP;
  const cosI = Math.cos(iDeg * DEG);
  const raanDot = -1.5 * factor * cosI;                 // rad/s
  const argDot = 0.75 * factor * (5 * cosI * cosI - 1); // rad/s
  return { raanDot: raanDot / DEG, argDot: argDot / DEG }; // deg/s
}

/** Periapsis distance from Earth center, km. */
export function periapsisDistance(a, e) {
  return a * (1 - e);
}

/**
 * Largest eccentricity for which the periapsis stays at/above the minimum
 * physical altitude for a given semi-major axis (orbit clears the atmosphere
 * floor rather than skimming the surface).
 */
export function maxEccentricityFor(a) {
  return Math.max(0, 1 - MIN_PERIAPSIS_KM / a);
}

/** Smallest semi-major axis keeping periapsis at/above the min altitude for given e. */
export function minSemiMajorFor(e) {
  return MIN_PERIAPSIS_KM / (1 - e);
}

/** True if the orbit's periapsis stays at/above the minimum physical altitude. */
export function isPhysicalOrbit(a, e) {
  return periapsisDistance(a, e) >= MIN_PERIAPSIS_KM;
}

/** Apoapsis distance from Earth center, km. */
export function apoapsisDistance(a, e) {
  return a * (1 + e);
}

// --- Anomaly conversions (for Kepler's second law animation) ---

/** True anomaly (deg) -> eccentric anomaly (rad). */
export function trueToEccentric(trueAnomalyDeg, e) {
  const nu = trueAnomalyDeg * DEG;
  return Math.atan2(Math.sqrt(1 - e * e) * Math.sin(nu), e + Math.cos(nu));
}

/** True anomaly (deg) -> mean anomaly (rad), normalized to [0, 2pi). */
export function trueToMean(trueAnomalyDeg, e) {
  const E = trueToEccentric(trueAnomalyDeg, e);
  let M = E - e * Math.sin(E);
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  return M;
}

/** Mean anomaly (rad) -> true anomaly (deg) via Newton's method on Kepler's eq. */
export function meanToTrue(meanAnomalyRad, e) {
  let M = meanAnomalyRad % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  let E = e < 0.8 ? M : Math.PI; // good initial guess
  for (let k = 0; k < 50; k++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  let deg = (nu / DEG) % 360;
  if (deg < 0) deg += 360;
  return deg;
}

/** Format seconds as "Xhr Ymin" (or "Ymin Zs" for short orbits). */
export function formatPeriod(seconds) {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}hr ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
