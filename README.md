# Kepler Orbital Simulator

A responsive React + Vite web app that visualizes Earth-satellite orbits from the
six classical Keplerian elements, with a live React Three Fiber 3D preview.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run test:math  # numeric checks on the orbital math
```

Requires Node 18+.

## What it does

- Six live sliders: semi-major axis (a), eccentricity (e), inclination (i),
  RAAN (Ω), argument of periapsis (ω), true anomaly (ν), grouped into
  Shape / Orientation / Position, each with a plain-English tooltip.
- 3D scene: textured Earth + additive atmosphere glow, equatorial reference
  grid, the orbit ellipse (drei `Line`), an animated satellite with a live
  velocity vector (ArrowHelper), and ascending (green) / descending (red)
  node markers.
- Element guides: each slider has an eye toggle that draws that element's
  geometric meaning in the 3D scene — the RAAN / inclination / argument-of-
  periapsis / true-anomaly angle wedges, the semi-major (apse) axis, and the
  eccentricity focus offset — each color-matched to its toggle.
- Ghost orbit: when you change any shape/orientation parameter, the previous
  orbit lingers as a fading dashed line for ~2 s.
- Animation that obeys Kepler's second law — the satellite advances by mean
  anomaly (constant in time) and is converted to true anomaly each frame, so
  it genuinely speeds up near periapsis. Play/pause + log-scale speed slider
  (1×–10,000×). The ν slider tracks the satellite during playback.
- Dynamics toggles:
  - **J2 precession** — models Earth's oblateness, drifting the line of nodes
    (RAAN) and the ellipse (argument of periapsis) over time. The drift advances
    during playback (use higher speeds to see it) and the RAAN / ω sliders track
    it, just like the ν slider tracks the satellite.
  - **Enforce physical orbits** — clamps eccentricity / semi-major axis so the
    periapsis stays at least 150 km up, clearing the atmosphere instead of
    cutting through the planet.
- Live data readout: orbital period (Xhr Ymin), current altitude, current
  velocity, periapsis/apoapsis altitude, a warning when apoapsis exceeds
  geostationary radius (42,164 km), and a red alert when the periapsis dips
  below the surface (an impossible orbit).
- Six accurate presets: ISS, Hubble, GPS, GEO, Molniya, Polar LEO.

## Layout

- Desktop (md+): 3D canvas fills the screen, fixed 340px control sidebar on the right.
- Mobile: canvas on top (55vh), scrollable control panel below, with play/pause +
  speed pinned to a thumb-accessible bar at the bottom. Sliders use
  `touch-action: none` so dragging never scrolls the page.

## Orbital math (`src/utils/kepler.js`)

Pure JS, no physics library. μ = 3.986×10¹⁴ m³/s². Earth radius 6,371 km maps to
1.0 scene unit. Implements `keplerToCartesian`, `orbitPoints`, `orbitalPeriod`,
`velocityAtAnomaly` (vis-viva), `periapsisDistance` / `apoapsisDistance`,
`precessionRates` (J2 secular drift of Ω and ω), the physical-orbit helpers
(`maxEccentricityFor` / `minSemiMajorFor` / `isPhysicalOrbit`), plus
`trueToMean` / `meanToTrue` (Newton solve of Kepler's equation) for the animation.

`npm run test:math` checks the formulas against known orbits (ISS ≈ 92.6 min &
7.66 km/s, GEO ≈ 1436 min & 3.07 km/s, conservation of angular momentum at the
apsides, true↔mean round-trips to <1e-6°, and the second-law speed-up at perigee).

## Notes

- The shadcn/ui components are implemented directly on their Radix primitives
  (`@radix-ui/react-slider`, `react-tooltip`, `react-select`) plus `vaul`, with the
  standard `cn()` helper — i.e. the exact code shadcn generates, vendored under
  `src/ui/primitives/` so the project installs and runs without the shadcn CLI step.
- ECI convention: the equatorial plane is the scene's XZ plane and celestial
  north is +Y, so the reference grid lies flat and the orbit tilts with inclination.
  ECI maps to the scene as `(x, z, -y)` — a proper right-handed rotation (not a
  reflection), so prograde orbits circulate the correct way.
