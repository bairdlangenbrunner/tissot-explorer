# CLAUDE.md

## Project overview

Tissot Indicatrix Explorer — a single-page interactive tool that visualizes map projection distortion. The user hovers over a map and sees a Tissot ellipse computed in real time from the projection's Jacobian.

## Architecture

Single HTML file (`index.html`). No build system, no framework. All dependencies loaded via CDN:

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
- 12 projections including Globe (orthographic) as a low-distortion baseline
- Each defined as a factory function that returns a fresh d3 projection instance
- Some projections have clip angles (Orthographic 90°, Stereographic 140°, Gnomonic 60°)

## Potential improvements

- Drag to rotate Globe/Orthographic projection
- Grid of static Tissot ellipses (traditional cartography textbook style) as an overlay toggle
- Color-coded distortion heatmap layer
- Side-by-side projection comparison mode
- Touch support for mobile
