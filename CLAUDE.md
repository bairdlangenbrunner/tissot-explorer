# CLAUDE.md

## Project overview

Tissot Explorer — a single-page interactive tool that visualizes map projection distortion using Tissot indicatrices. The user hovers over a map and sees a Tissot ellipse computed in real time from the projection's Jacobian. An about modal explains the tool and metrics to users.

## Architecture

React + TypeScript app built with Vite. Dependencies:

- React 18 + TypeScript
- D3.js v7 + d3-geo-projection v4
- TopoJSON Client v3
- World Atlas land-110m (fetched at runtime from jsDelivr)

## Key implementation details

### Tissot math (`tissotAtPoint`)
- Computes numerical partial derivatives of the projection function (∂x/∂λ, ∂y/∂λ, ∂x/∂φ, ∂y/∂φ) using a small epsilon step
- Longitude derivatives are scaled by cos(lat) to account for meridian convergence
- Derives h (meridian scale), k (parallel scale), and the angle between them
- Computes semimajor/semiminor axes of the indicatrix ellipse, area scale factor, and max angular distortion (ω)

### Clipping
- SVG `<clipPath>` tied to the projection's sphere outline path
- The indicatrix layer has `clip-path` applied so ellipses are clipped at the projection boundary

### Projection list
- 12 projections including globe (orthographic) as a low-distortion baseline
- Each defined as a factory function that returns a fresh d3 projection instance
- Some projections have clip angles (orthographic 90°, stereographic 140°, gnomonic 60°)

## Style rules

- Use sentence case for all text: only capitalize the first word of a title/subtitle, the first word of a sentence, or proper nouns.

## Potential improvements

- Drag to rotate globe/orthographic projection
- Grid of static Tissot ellipses (traditional cartography textbook style) as an overlay toggle
- Color-coded distortion heatmap layer
- Side-by-side projection comparison mode
- Touch support for mobile
