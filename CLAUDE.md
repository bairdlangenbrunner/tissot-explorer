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
- `supportsLatRotation` flag on `ProjectionDef` marks projections where central latitude rotation is cartographically meaningful (azimuthal, conic, Transverse Mercator) — plumbing exists in `MapCanvas` and `CentralLonSlider` but the latitude slider UI is currently commented out in `App.tsx`

### Controls
- Projection picker with grouped buttons (collapsible on desktop, dropdown on mobile)
- Desktop collapsed view shows only the active projection's category
- Mobile dropdown dismisses on outside touch (`touchend` listener)
- Group labels have accessible tooltips: focusable (`tabIndex={0}`), `role="tooltip"`, `aria-describedby`, dismiss with Escape
- Random projection button with undo history
- Central longitude slider with reset (preserved across projection changes)
- Size scaling toggle (iOS-style switch)
- Light/dark theme toggle
- `CentralLonSlider` component is reusable — accepts `label`, `min`, `max`, and `disabled` props for use as either a longitude or latitude slider

## Style rules

- Use sentence case for all text: only capitalize the first word of a title/subtitle, the first word of a sentence, or proper nouns.

## Potential improvements

See [ROADMAP.md](ROADMAP.md) for the full list of feature ideas and future directions.
