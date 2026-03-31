# CLAUDE.md

## Project overview

Projection Explorer — a single-page interactive tool that visualizes map projection distortion using Tissot indicatrices. The user hovers (or touches on mobile) over a map and sees a Tissot ellipse computed in real time from the projection's Jacobian. An about modal explains the tool and metrics to users.

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

### Size scaling
- Toggle (on by default) controls whether the Tissot ellipse reflects actual scale
- When on, ellipse size is proportional to the local scale factor relative to `proj.scale()`
- When off, the ellipse is normalized to a fixed radius so only shape distortion is visible
- The dashed reference circle represents a scale factor of 1.0 (no distortion)

### Edge behavior
- The indicatrix layer is rendered outside the SVG clip group so ellipses are not clipped at projection boundaries
- When the pointer moves outside the projection boundary, the Tissot freezes at the last valid position
- Clip angle check rejects points beyond the boundary for azimuthal projections (orthographic, stereographic, gnomonic)
- Clip extent check rejects points outside the visible rectangle for conic projections

### Projection list
- 30 projections organized into 6 groups: conformal, equal-area, compromise, equidistant, azimuthal, and other
- Each defined as a factory function that returns a fresh d3 projection instance
- Some projections have clip angles (orthographic 90°, stereographic 140°, gnomonic 60°)
- Conic projections use a bounded graticule for `fitExtent` and an explicit `clipExtent`

### Controls
- Projection picker with grouped buttons (collapsible on desktop, dropdown on mobile)
- Random projection button
- Central longitude slider with reset
- Size scaling toggle (iOS-style switch)

## Style rules

- Use sentence case for all text: only capitalize the first word of a title/subtitle, the first word of a sentence, or proper nouns.

## Potential improvements

### Interaction
- Drag to rotate (desktop only, or two-finger on mobile) as a complement to the longitude slider — conflicts with single-finger Tissot on mobile, so needs careful gesture design
- Central latitude slider (most useful for azimuthal projections where it shifts the viewpoint pole)
- Projection scale/zoom — zoom into a region to examine local distortion in detail
- Pinch-to-zoom on mobile

### Visualization
- Grid of static Tissot ellipses (traditional cartography textbook style) as an overlay toggle
- Color-coded distortion heatmap layer (e.g., area distortion as a choropleth)
- Animated transition when switching projections (interpolate between projection functions)
- Show graticule labels (latitude/longitude values along edges)

### Comparison and education
- Side-by-side projection comparison mode
- Standard parallels slider for conic projections (adjust where distortion is minimized)
- Projection family descriptions — explain what conformal/equal-area/compromise means in more detail
- "Best projection for..." guide — suggest projections based on use case (navigation, thematic maps, etc.)

### Technical
- URL-based state (share a link to a specific projection + longitude + settings)
- Keyboard navigation for projection switching
- Offline support / PWA
- Performance: canvas-based rendering for smoother interaction on low-end devices
