# Projection Explorer

An interactive tool for visualizing how map projections distort the Earth's surface using [Tissot indicatrices](https://en.wikipedia.org/wiki/Tissot%27s_indicatrix).

Hover (or touch on mobile) over any point on the map to see a real-time Tissot indicatrix showing local distortion — how shapes, areas, and angles are deformed by the current projection.

## Features

- **30 map projections** across 6 categories — conformal, equal-area, compromise, equidistant, azimuthal, and other
- **Real-time Tissot indicatrix** — hover or touch to see distortion at any point, with the ellipse freezing at the projection edge rather than disappearing
- **Size scaling** — on by default, the ellipse grows and shrinks to reflect actual scale distortion; toggle off to normalize size and focus on shape distortion alone
- **Distortion metrics** — meridian scale (h), parallel scale (k), area scale, and max angular distortion (omega)
- **Central longitude slider** — re-center the map on any meridian
- **Random projection** — jump to a random projection to explore
- **Responsive design** — works on desktop, tablet, and mobile with touch support
- **About modal** — built-in explanation of the tool, metrics, and controls

## Getting started

```bash
npm install
npm run dev
```

## How it works

The app computes numerical partial derivatives of the projection function at the cursor position to build the Jacobian matrix. From this it derives the Tissot indicatrix ellipse parameters — semimajor/semiminor axes, orientation, area scale factor, and maximum angular distortion.

When size scaling is on, the ellipse size is proportional to the local scale factor, so a larger ellipse means the projection is enlarging that region. The dashed reference circle represents no distortion (scale factor of 1.0).

## Built with

- React + TypeScript + Vite
- D3.js v7 + d3-geo-projection v4
- TopoJSON Client v3
