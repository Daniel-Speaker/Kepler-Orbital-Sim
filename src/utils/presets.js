// Accurate-ish Keplerian elements for well-known Earth orbits.
export const PRESETS = {
  ISS:        { label: "ISS",          a: 6778,  e: 0.0007, i: 51.6, raan: 0, argPerigee: 0, nu: 0, note: "Low Earth orbit" },
  Hubble:     { label: "Hubble",       a: 6955,  e: 0.0003, i: 28.5, raan: 0, argPerigee: 0, nu: 0, note: "LEO, low inclination" },
  GPS:        { label: "GPS Satellite",a: 26560, e: 0.01,   i: 55.0, raan: 0, argPerigee: 0, nu: 0, note: "MEO" },
  GEO:        { label: "GEO Weather Sat", a: 42164, e: 0.0001, i: 0.1, raan: 0, argPerigee: 0, nu: 0, note: "Geostationary" },
  Molniya:    { label: "Molniya",      a: 26560, e: 0.74,   i: 63.4, raan: 0, argPerigee: 270, nu: 0, note: "Highly elliptical" },
  PolarLEO:   { label: "Polar LEO",    a: 6778,  e: 0.001,  i: 98.0, raan: 0, argPerigee: 0, nu: 0, note: "Sun-synchronous approx" },
};
export const PRESET_ORDER = ["ISS", "Hubble", "GPS", "GEO", "Molniya", "PolarLEO"];
