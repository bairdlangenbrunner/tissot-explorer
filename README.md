# Tissot Explorer

An interactive tool for visualizing how map projections distort the Earth's surface using [Tissot indicatrices](https://en.wikipedia.org/wiki/Tissot%27s_indicatrix).

Hover over any point on the map to see a real-time Tissot ellipse showing local distortion — how shapes, areas, and angles are deformed by the current projection.

## Features

- **12 map projections** — from Mercator and Mollweide to orthographic and gnomonic
- **Real-time Tissot indicatrix** — hover to see distortion at any point
- **Distortion metrics** — meridian scale (h), parallel scale (k), area scale, and max angular distortion (omega)
- **About modal** — built-in explanation of the tool and what the metrics mean

## Getting started

```bash
npm install
npm run dev
```

## How it works

The app computes numerical partial derivatives of the projection function at the cursor position to build the Jacobian matrix. From this it derives the Tissot indicatrix ellipse parameters — semimajor/semiminor axes, orientation, area scale factor, and maximum angular distortion.

## Built with

- React + TypeScript + Vite
- D3.js v7 + d3-geo-projection v4
- TopoJSON Client v3
