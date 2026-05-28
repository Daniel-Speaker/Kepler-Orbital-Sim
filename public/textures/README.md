# Earth textures

Drop the Earth surface texture here:

- **`earth_day.jpg`** — an equirectangular (2:1 aspect, e.g. 2048×1024) color/day map.

The app loads `/textures/earth_day.jpg` at runtime. If the file is missing, the
globe falls back to a plain blue sphere — so nothing breaks before you add it.

## Where to get one (free, CC-BY)

https://www.solarsystemscope.com/textures/ → "Earth" → download the **2k Day Map**,
rename it to `earth_day.jpg`, and place it in this folder.

Notes:
- Keep it equirectangular so it wraps the sphere correctly.
- The mesh is intentionally **not** axially tilted — this is an Earth-centered
  inertial view, so the equator must stay aligned with the reference grid.
