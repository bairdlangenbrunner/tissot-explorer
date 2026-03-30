# Tissot Indicatrix Explorer

An interactive tool for visualizing map projection distortion using [Tissot's indicatrix](https://en.wikipedia.org/wiki/Tissot%27s_indicatrix). Move your pointer over any projection and watch a distortion ellipse follow in real time — showing how the projection stretches, compresses, and shears the Earth's surface at that point.

## How it works

A small circle on a globe gets distorted into an ellipse when projected onto a flat map. The shape of that ellipse tells you everything about the local distortion:

- **Circular** → no distortion (conformal at that point)
- **Elliptical but same area** → shape distortion only (equal-area projection)
- **Larger/smaller circle** → area distortion (the map is lying about relative sizes)
- **Tilted ellipse** → angular distortion (directions are being bent)

The indicatrix is computed numerically from the Jacobian of the projection function — partial derivatives of the screen-space mapping with respect to longitude and latitude — rather than using precomputed lookup tables.

## Features

- **12 projections**: Globe, Mercator, Equirectangular, Mollweide, Robinson, Eckert IV, Azimuthal Equal-Area, Stereographic, Gnomonic, Conic Equidistant, Natural Earth, Sinusoidal
- **Real-time Tissot ellipse** following the pointer, clipped to the projection boundary
- **Distortion readout** showing area scale factor and maximum angular distortion
- **Reference circle** (dashed) for visual comparison against the distorted ellipse

## Tech

Single HTML file. Dependencies loaded via CDN:

- [D3.js](https://d3js.org/) v7 — projections, geo path rendering, SVG manipulation
- [d3-geo-projection](https://github.com/d3/d3-geo-projection) — extended projection library
- [TopoJSON Client](https://github.com/topojson/topojson-client) — world boundary data
- [Natural Earth](https://www.naturalearthdata.com/) land polygons via [world-atlas](https://github.com/topojson/world-atlas)

## Running locally

Open `index.html` in a browser. That's it — no build step, no dependencies to install.

Or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Things to notice

- **Mercator**: Circles stay circular everywhere (it's conformal!) but grow enormous near the poles
- **Mollweide**: Ellipses change shape dramatically but area stays ~1.0× (it's equal-area)
- **Globe (Orthographic)**: Nearly perfect at center, stretches toward the limb
- **Gnomonic**: Can only show a small patch — distortion explodes at the edges
- **Stereographic**: Conformal like Mercator, but maps from a different vantage point

## Author

[Baird Langenbrunner](https://bairdlangenbrunner.com)
