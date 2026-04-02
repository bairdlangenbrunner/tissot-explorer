# Roadmap

Feature ideas and potential improvements for Projection Explorer.

---

## Interaction

- **Drag to rotate** — click-and-drag to change lon/lat center, replacing or complementing the sliders. Two-finger drag on mobile to avoid conflicting with single-finger Tissot touch.
- **Central latitude slider** — plumbing already exists (commented out in `App.tsx`). Enable for azimuthal, conic, and Transverse Mercator projections where it's cartographically meaningful.
- **Animated projection morphing** — interpolate between projections when switching so users see the geometric transformation unfold.
- **Custom center point** — click a point to set it as the projection center (especially powerful for azimuthal projections).
- **Pinch-to-zoom** on mobile, scroll-to-zoom on desktop — zoom into a region to examine local distortion in detail.

## Visualization

- **Static Tissot grid overlay** — toggle a traditional grid of indicatrices (like a cartography textbook), useful for seeing the full distortion pattern at a glance without hovering.
- **Distortion heatmap** — color-coded overlay showing area or angular distortion across the whole map, not just at the cursor point.
- **Great circle routes** — draw a route between two points to show how projections affect path appearance (straight on Mercator = rhumb line, curved on others).
- **Country boundaries** — toggle political borders on/off (currently just land mass).
- **Graticule labels** — show latitude/longitude values along edges.

## Comparison and exploration

- **Side-by-side mode** — two projections shown simultaneously with synced cursor position, so users can directly compare distortion at the same point.
- **Area comparison tool** — select a country and see its true area vs. projected area, making Mercator distortion viscerally obvious.
- **Standard parallels slider** for conic projections — let users drag the parallels and watch how the distortion pattern shifts.
- **"Best projection for..." wizard** — user picks a use case (navigation, thematic map of Africa, polar research) and the app highlights suitable projections with explanations.

## Education

- **Guided tour / walkthrough** — first-visit onboarding that walks through Mercator vs. an equal-area projection, pointing out what the ellipse shape means.
- **"Why does this matter?" examples** — show practical consequences (Mercator makes Greenland look the size of Africa; Peters preserves area but warps shapes).
- **Projection family deep-dives** — expandable sections explaining the math and tradeoffs of each family, with interactive demos.
- **Quiz mode** — show a projection and ask the user to guess its type (conformal, equal-area, etc.) based on the Tissot pattern.

## Technical and polish

- **URL state** — encode projection, longitude, theme, and size-scaling in the URL so users can share a specific view.
- **Canvas rendering** — switch from SVG to Canvas for smoother performance, especially on mobile or with heatmap/grid overlays.
- **Keyboard navigation** — arrow keys to cycle projections, `r` for random, `u` for undo.
- **PWA / offline** — cache the world topology and work offline.
- **Export** — save the current map view as SVG or PNG for use in presentations.
- **Embed mode** — minimal-chrome iframe-friendly version for embedding in blog posts or course materials.

## Stretch

- **3D globe view** — toggle between flat projection and a 3D globe (using Orthographic or WebGL) to build intuition about what projections "do" to the sphere.
- **User-uploaded data** — overlay a GeoJSON dataset and see how its shapes are affected by projection choice.
- **Projection builder** — let users tweak parameters (standard parallels, aspect, center) and see results in real time.
