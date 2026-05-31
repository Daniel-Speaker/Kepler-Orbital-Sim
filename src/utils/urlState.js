// Encode/decode the shareable orbit state in the URL query string, so a link
// reproduces the exact orbit + view options. Kept compact with short keys.
import { PRESETS } from "./presets";

export const DEFAULTS = { a: 6778, e: 0.001, i: 51.6, raan: 0, argPerigee: 0, nu: 0 };

const VIZ_KEYS = ["a", "e", "i", "raan", "argPerigee", "nu"];
const tokenFor = (k) => (k === "argPerigee" ? "argp" : k);
const keyFor = (t) => (t === "argp" ? "argPerigee" : t);

const emptyViz = () =>
  VIZ_KEYS.reduce((o, k) => ((o[k] = false), o), {});

/** Find a preset whose elements match these params (so the dropdown highlights). */
export function matchPreset(params) {
  for (const key of Object.keys(PRESETS)) {
    const p = PRESETS[key];
    if (
      Math.round(p.a) === Math.round(params.a) &&
      Math.abs(p.e - params.e) < 5e-4 &&
      Math.abs(p.i - params.i) < 0.05 &&
      Math.abs(p.raan - params.raan) < 0.5 &&
      Math.abs(p.argPerigee - params.argPerigee) < 0.5
    ) {
      return key;
    }
  }
  return null;
}

/** Parse the current URL into a state object, or null if there are no params. */
export function parseUrlState() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  if ([...q.keys()].length === 0) return null;

  const num = (k, d) => {
    const v = parseFloat(q.get(k));
    return Number.isFinite(v) ? v : d;
  };
  const bool = (k, d) => {
    const v = q.get(k);
    return v == null ? d : v === "1";
  };

  const params = {
    a: num("a", DEFAULTS.a),
    e: num("e", DEFAULTS.e),
    i: num("i", DEFAULTS.i),
    raan: num("raan", DEFAULTS.raan),
    argPerigee: num("argp", DEFAULTS.argPerigee),
    nu: num("nu", DEFAULTS.nu),
  };

  const viz = emptyViz();
  const vizStr = q.get("viz");
  if (vizStr) vizStr.split(",").forEach((t) => {
    const k = keyFor(t);
    if (k in viz) viz[k] = true;
  });

  return {
    params,
    precession: bool("prec", false),
    precessionBoost: num("boost", 50),
    enforcePhysical: bool("phys", false),
    showApsides: bool("apo", true),
    primaryView: q.get("view") === "ground" ? "ground" : "3d",
    showPip: bool("pip", true),
    trackOrbits: num("to", 2),
    viz,
  };
}

/** Serialize state into a query string (omits defaults to stay short). */
export function serializeUrlState(s) {
  const q = new URLSearchParams();
  q.set("a", String(Math.round(s.params.a)));
  q.set("e", (+s.params.e).toFixed(4));
  q.set("i", (+s.params.i).toFixed(2));
  q.set("raan", (+s.params.raan).toFixed(2));
  q.set("argp", (+s.params.argPerigee).toFixed(2));
  q.set("nu", (+s.params.nu).toFixed(2));

  if (s.precession) q.set("prec", "1");
  if (s.precession && Math.round(s.precessionBoost) !== 50) q.set("boost", String(Math.round(s.precessionBoost)));
  if (s.enforcePhysical) q.set("phys", "1");
  if (!s.showApsides) q.set("apo", "0"); // default on
  if (s.primaryView === "ground") q.set("view", "ground"); // default 3d
  if (!s.showPip) q.set("pip", "0"); // default on
  if (Math.round(s.trackOrbits) !== 2) q.set("to", String(Math.round(s.trackOrbits)));

  const on = VIZ_KEYS.filter((k) => s.viz?.[k]).map(tokenFor);
  if (on.length) q.set("viz", on.join(","));

  return q.toString();
}
