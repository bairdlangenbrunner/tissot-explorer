# Expert review: Projection Explorer

*Updated 2026-04-01 against current working tree*

---

## 1. Accessibility (WCAG 2.2 AA)

**Critical — SVG map has no accessible alternative**
- `src/components/MapCanvas.tsx:379` — The `<svg>` has no `role`, `aria-label`, or descriptive text. Screen reader users get nothing.
- **Fix:** Add `role="img"` and `aria-label="Interactive map showing {projectionName} projection"` to the SVG. Consider an `aria-live="polite"` region for the metrics so screen readers announce changes.

**Critical — InfoPanel metrics not announced to screen readers**
- `src/components/InfoPanel.tsx:26-45` — When the user moves their pointer, metrics update silently. Screen reader users never learn about position or distortion values.
- **Fix:** Add `aria-live="polite"` to the info-panel container, or use a visually hidden live region that announces summarized changes (debounced to avoid flooding).

**Major — Toggle switch has no role or state**
- `src/App.tsx:81-87` and `src/App.tsx:94-100` — The size scaling toggle is a `<button>` with `aria-label="Toggle size scaling"` but no `role="switch"` or `aria-checked` attribute. Assistive technology can't communicate the toggle's on/off state.
- **Fix:** Add `role="switch"` and `aria-checked={showSize}` to both instances of the toggle button.

**Major — Modal missing `aria-labelledby`**
- `src/components/AboutModal.tsx:52` — The modal has `role="dialog"` and `aria-modal="true"` but no `aria-labelledby` or `aria-label`. Screen readers won't announce the dialog's purpose.
- **Fix:** Add an `id` to a heading inside the modal (or add one, since the modal currently has no `<h2>`) and reference it with `aria-labelledby`.

**Major — Modal close button uses sticky float pattern**
- `src/components/AboutModal.tsx:54` — The close button has `aria-label="Close"` (good), but the `position: sticky; float: right` CSS pattern (`src/index.css:516-531`) can cause focus order confusion since it's the first focusable element but visually positioned top-right.
- **Fix:** Move the close button to be the last element in the modal markup, or use CSS to visually position it without float.

**Major — Projection buttons lack accessible group context**
- `src/components/ProjectionPicker.tsx:34-57` — Projection buttons are `<button>` elements inside plain divs. There's no `role="group"` or `aria-label` on the groups, so a screen reader user doesn't know they're navigating "Conformal" vs "Equal-area" projections.
- **Fix:** Add `role="group"` and `aria-label={group.label}` to each `.projection-group` div.

~~**Major — Group tooltips are inaccessible on desktop**~~ **FIXED**
- Group label tooltips now have `role="tooltip"`, unique `id` attributes, and `aria-describedby` on the label. Labels are focusable (`tabIndex={0}`), tooltips show on `:focus` as well as `:hover`, and pressing Escape dismisses them. A visible focus outline is also provided.

**Minor — No `prefers-reduced-motion` support**
- CSS transitions on toggle knob (`src/index.css:379`), dropdown arrow (`src/index.css:678-679`), and hint opacity don't respect `prefers-reduced-motion`.
- **Fix:** Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`

**Minor — "Random" and "About" buttons have no `aria-label`**
- `src/App.tsx:67-71` — These are fine for sighted users but terse labels like "random" don't communicate purpose. Minor since the visible text itself is readable.

~~**Minor — Slider thumb is 14px (below 44px touch target)**~~ **FIXED**
- The slider thumb is now 24×24px (`src/index.css:273-278`), up from the original 14px. Still below the 44px WCAG recommendation for touch targets, but a reasonable improvement.

---

## 2. UX and interaction design

**Major — No onboarding for first-time users**
- The CSS defines a `.hint` class (`src/index.css:438-452`) but it is not rendered anywhere in the current JSX. There is no visible onboarding guidance — users land on a random projection with no explanation of what to do.
- **Fix:** Re-add the hint element ("hover over the map to see distortion") to MapCanvas, or implement a brief first-visit tooltip. The About modal content is excellent but users must discover and click it.

**Major — Metrics use specialist terminology without inline help**
- `src/components/InfoPanel.tsx:34-43` — "Area distortion" and "Angular distortion" are shown raw. The `(enlarged)` / `(shrunk)` / `(≈preserved)` labels help for area, but angular distortion `12.3° max` means nothing to most users.
- **Fix:** Add a subtle `title` attribute or `(i)` icon linking to the About modal section, or show a qualitative label like "low / moderate / high distortion."

**Major — Random initial projection can confuse new users**
- `src/App.tsx:10` — The app starts on a random projection. A first-time visitor might land on Gingery or Peirce Quincuncial and have no idea what they're looking at.
- **Fix:** Default to a recognizable projection (e.g., Natural Earth or Robinson) on first visit. Use `localStorage` to remember the last-used projection.

**Minor — Mobile dropdown can overflow on small screens**
- `src/index.css:690` — `max-height: calc(100dvh - 120px)` could still be tight with many projections. The dropdown scrolls, which is good, but there's no visual scroll indicator.

~~**Minor — Central longitude resets to 0 on projection change**~~ **FIXED**
- Central longitude is now preserved across projection changes and undo.

**Minor — No keyboard shortcut for switching projections**
- Power users would benefit from arrow key navigation through projections, or `r` for random.

---

## 3. Code quality and front-end best practices

**Major — D3 DOM manipulation on every render cycle**
- `src/components/MapCanvas.tsx:96` — `root.selectAll('*').remove()` nukes the entire SVG and rebuilds from scratch on every projection change, resize, or central longitude change. This works but is inefficient.
- **Fix:** Consider using D3's enter/update/exit pattern, or at minimum, only update `d` attributes on existing elements rather than destroying/recreating them.

**Major — `renderMap` called inside fetch effect without being a dependency**
- `src/components/MapCanvas.tsx:40` — `renderMap()` is called inside the world-data fetch `useEffect` (lines 31-42), but the effect has an empty dependency array `[]` while `renderMap` is a `useCallback` that changes when `projectionIndex` or `centralLon` change. The initial call works because a separate `useEffect` at line 152-154 also calls `renderMap` on `[renderMap]`. However, the stale closure in the fetch effect means if the fetch resolves after a projection change, it will call an outdated `renderMap`.
- **Fix:** Use a ref flag (e.g., `worldLoadedRef`) and trigger re-render via state when world data loads, rather than calling `renderMap` directly inside the fetch.

**Major — Missing exhaustive deps in `useEffect`**
- `src/components/MapCanvas.tsx:242-246` — `useEffect` uses `coords` and `drawIndicatrix` but only lists `[showSize]` in the dependency array. This works because `drawIndicatrix` already depends on `showSize` via its own `useCallback`, but it's fragile and will trigger ESLint `exhaustive-deps` warnings.
- **Fix:** Either add the proper deps or restructure to avoid the issue.

**Minor — `window.matchMedia` called on every render**
- `src/components/MapCanvas.tsx:53` — `window.matchMedia('(max-width: 640px)')` runs inside `renderMap` on every call. Use a cached result or a `useMediaQuery` hook.

**Minor — No error handling for world data fetch**
- `src/components/MapCanvas.tsx:32-41` — If the jsDelivr CDN is down, the app silently shows an empty map with just a graticule. No retry, no fallback, no error state.
- **Fix:** Add a `.catch()` handler and a fallback message.

**Minor — Inline SVG icons could be extracted**
- `src/App.tsx:62-64` (undo icon) and `src/App.tsx:110-125` (sun/moon theme icons) — inline SVG in JSX. Not a major issue, but extracting to small components would improve readability.

**Minor — CSS uses hardcoded colors instead of variables**
- `src/index.css:235-237` — `.controls button.active` uses `#d04e2e` and `#fff` instead of `var(--accent)` and a white variable, so the active button color won't adapt if themes are extended.

---

## 4. Visual design

**Minor — Light mode land color contrast could be better**
- `--land: #9ab8a0` against `--ocean: #d6e6f5` — the land/ocean distinction is somewhat muted in light mode. Consider slightly more contrast.

**Minor — Info panel overlaps map content with no background**
- The info panel at `bottom: 20px; left: 28px` (`src/index.css:401-411`) is `pointer-events: none` (good) but can obscure map features in the lower-left. No background means text can be hard to read against certain land/ocean colors.
- **Fix:** Add a subtle `backdrop-filter: blur(4px)` or semi-transparent background behind the panel.

**Minor — Theme toggle position conflicts with browser UI on mobile landscape**
- `src/index.css:538-556` — Fixed `bottom: 20px; right: 20px` can overlap with browser UI or scrollbar in landscape mode.

**Suggestion — Active button state has no transition back**
- When switching projections, the previously active button snaps back instantly while the new one transitions in. A brief transition on the deactivating button would feel smoother.

---

## Top 10 prioritized changes

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | Critical | Add `aria-live` region for Tissot metrics | Screen reader users can't perceive the core functionality |
| 2 | Critical | Add accessible label/role to SVG map | Map is invisible to assistive technology |
| 3 | Major | Add `role="switch"` + `aria-checked` to toggle | Toggle state not communicated to AT users |
| 4 | Major | Add `role="group"` + `aria-label` to projection groups | No category context for keyboard/SR navigation |
| ~~5~~ | ~~Major~~ | ~~Make group tooltips keyboard/SR accessible~~ | ~~FIXED — tooltips now focusable, have `role="tooltip"`, `aria-describedby`, Escape to dismiss~~ |
| 5 | Major | Add `aria-labelledby` to the About modal | Dialog purpose not announced |
| 6 | Major | Re-add onboarding hint (currently missing from JSX) | No guidance at all for first-time users |
| 7 | Major | Default to a recognizable projection on first visit | Random start confuses new users |
| 8 | Major | Fix `useEffect` dependency arrays in MapCanvas | Fragile code that may break on React upgrades |
| 9 | Minor | Add `prefers-reduced-motion` support | Motion-sensitive users have no relief |
| 10 | Minor | Add error handling for world data fetch | Silent failure if CDN is unavailable |
