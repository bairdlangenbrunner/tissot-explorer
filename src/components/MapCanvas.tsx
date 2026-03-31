import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3-geo';
import { select } from 'd3-selection';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { GeoProjection } from 'd3-geo';
import type { FeatureCollection } from 'geojson';
import { projections } from '../lib/projections';
import { tissotAtPoint, type TissotResult } from '../lib/tissot';
import { InfoPanel } from './InfoPanel';

interface Props {
  projectionIndex: number;
  centralLon: number;
  showSize: boolean;
}

const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';

export function MapCanvas({ projectionIndex, centralLon, showSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const projectionRef = useRef<GeoProjection | null>(null);
  const hasClipExtentRef = useRef(false);
  const clipBoundsRef = useRef<[[number, number], [number, number]] | null>(null);
  const worldRef = useRef<FeatureCollection | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [tissot, setTissot] = useState<TissotResult | null>(null);

  // Load world data once
  useEffect(() => {
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        worldRef.current = topojson.feature(
          topo,
          topo.objects.land,
        ) as unknown as FeatureCollection;
        // Re-render after load
        renderMap();
      });
  }, []);

  const renderMap = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // On mobile, center between top and info panel; on desktop, center in the full container
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const infoEl = isMobile
      ? (container.querySelector('.info-panel') as HTMLElement | null)
      : null;
    const infoPanelHeight = infoEl ? infoEl.offsetHeight : 0;

    const proj = projections[projectionIndex].fn();
    const currentRotation = proj.rotate();
    proj.rotate([-centralLon, currentRotation[1], currentRotation[2] ?? 0]);
    const marginX = w * 0.075;
    const marginTop = h * 0.05;
    const marginBottom = h * 0.1;
    const availH = h - infoPanelHeight;
    const fitObject = projections[projectionIndex].conic
      ? d3.geoGraticule().extent([[-180, -80], [180, 84]]).outline()
      : { type: 'Sphere' as const };
    const extent: [[number, number], [number, number]] = [
      [marginX, marginTop],
      [w - marginX, availH - marginBottom],
    ];
    proj.fitExtent(extent, fitObject);
    if (projections[projectionIndex].conic) {
      // Don't set clipExtent on the projection — d3's post-projection polygon
      // clipper can produce fill artifacts for conic projections near the
      // singularity. The SVG <clipPath> handles visual clipping instead.
      hasClipExtentRef.current = true;
      clipBoundsRef.current = extent;
    } else {
      hasClipExtentRef.current = false;
      clipBoundsRef.current = null;
    }
    projectionRef.current = proj;

    const path = d3.geoPath(proj);
    const root = select(svg);

    // Clear and rebuild
    root.selectAll('*').remove();

    // Build clip path — use rectangle for conics, sphere outline for others
    const defs = root.append('defs');
    const isConic = projections[projectionIndex].conic;
    const outlinePath = path({ type: 'Sphere' }) ?? '';
    const clip = defs.append('clipPath').attr('id', 'projection-clip');
    if (isConic) {
      clip
        .append('rect')
        .attr('x', extent[0][0])
        .attr('y', extent[0][1])
        .attr('width', extent[1][0] - extent[0][0])
        .attr('height', extent[1][1] - extent[0][1]);
    } else {
      clip.append('path').attr('d', outlinePath);
    }

    // Outline (ocean)
    if (isConic) {
      root
        .append('rect')
        .attr('x', extent[0][0])
        .attr('y', extent[0][1])
        .attr('width', extent[1][0] - extent[0][0])
        .attr('height', extent[1][1] - extent[0][1])
        .attr('fill', 'var(--ocean)')
        .attr('stroke', 'var(--outline)')
        .attr('stroke-width', 1.5);
    } else {
      root
        .append('path')
        .attr('d', outlinePath)
        .attr('fill', 'var(--ocean)')
        .attr('stroke', 'var(--outline)')
        .attr('stroke-width', 1.5);
    }

    // Clipped group for graticule and land
    const clipped = root
      .append('g')
      .attr('clip-path', 'url(#projection-clip)');

    // Graticule
    const graticule = d3.geoGraticule().step([15, 15]);
    clipped
      .append('path')
      .datum(graticule())
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'var(--graticule)')
      .attr('stroke-width', 0.5);

    // Land
    if (worldRef.current) {
      clipped
        .append('path')
        .datum(worldRef.current)
        .attr('d', path)
        .attr('fill', 'var(--land)')
        .attr('stroke', 'var(--land-stroke)')
        .attr('stroke-width', 0.4);
    }

    // Indicatrix group (outside clipped group so it's not clipped at edges)
    root
      .append('g')
      .attr('class', 'indicatrix-layer');
  }, [projectionIndex, centralLon]);

  // Re-render on projection change or world load
  useEffect(() => {
    renderMap();
  }, [renderMap]);

  // Re-render when the container size changes (window resize or controls collapse)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => renderMap());
    observer.observe(container);
    return () => observer.disconnect();
  }, [renderMap]);

  const drawIndicatrix = useCallback(
    (lon: number, lat: number) => {
      const svg = svgRef.current;
      const proj = projectionRef.current;
      if (!svg || !proj) return;

      const g = select(svg).select<SVGGElement>('.indicatrix-layer');
      g.selectAll('*').remove();

      const result = tissotAtPoint(proj, lon, lat);
      if (!result) return;

      setTissot(result);
      const { center, a, b, angle } = result;

      const baseRadius = 36;
      const maxAxis = Math.max(a, b);
      // In size mode, use a fixed scale so the reference circle = no distortion
      // In normal mode, normalize so the largest axis fits baseRadius
      const scale = showSize
        ? (baseRadius * 0.5) / proj.scale()
        : maxAxis > 0
          ? baseRadius / maxAxis
          : 1;

      // Ellipse
      g.append('ellipse')
        .attr('cx', center[0])
        .attr('cy', center[1])
        .attr('rx', a * scale)
        .attr('ry', b * scale)
        .attr(
          'transform',
          `rotate(${(-angle * 180) / Math.PI}, ${center[0]}, ${center[1]})`,
        )
        .attr('fill', 'var(--indicatrix-fill)')
        .attr('stroke', 'var(--indicatrix-stroke)')
        .attr('stroke-width', 1.5);

      // Reference circle
      g.append('circle')
        .attr('cx', center[0])
        .attr('cy', center[1])
        .attr('r', baseRadius * 0.5)
        .attr('fill', 'none')
        .attr('stroke', 'var(--indicatrix-stroke)')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.35);

      // Crosshairs
      const crossSize = Math.max(a, b) * scale + 4;
      const cosA = Math.cos(-angle);
      const sinA = Math.sin(-angle);

      g.append('line')
        .attr('x1', center[0] - cosA * crossSize)
        .attr('y1', center[1] - sinA * crossSize)
        .attr('x2', center[0] + cosA * crossSize)
        .attr('y2', center[1] + sinA * crossSize)
        .attr('stroke', 'var(--indicatrix-stroke)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);

      g.append('line')
        .attr('x1', center[0] + sinA * crossSize)
        .attr('y1', center[1] - cosA * crossSize)
        .attr('x2', center[0] - sinA * crossSize)
        .attr('y2', center[1] + cosA * crossSize)
        .attr('stroke', 'var(--indicatrix-stroke)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    },
    [showSize],
  );

  const isTouchingRef = useRef(false);

  const clearIndicatrix = useCallback(() => {
    const svg = svgRef.current;
    if (svg) {
      select(svg).select('.indicatrix-layer').selectAll('*').remove();
    }
    setCoords(null);
    setTissot(null);
  }, []);

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      // For touch, only respond while finger is down
      if (e.pointerType === 'touch' && !isTouchingRef.current) return;

      const proj = projectionRef.current;
      if (!proj || !proj.invert) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const inverted = proj.invert([x, y]);
      if (!inverted || isNaN(inverted[0]) || isNaN(inverted[1])) {
        // Keep last valid indicatrix frozen at the edge
        return;
      }

      const [lon, lat] = inverted;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return;
      }

      // For conic projections, reject points outside the visible rect
      const clipBounds = hasClipExtentRef.current ? clipBoundsRef.current : null;
      if (clipBounds) {
        const reprojCheck = proj([lon, lat]);
        if (
          reprojCheck &&
          (reprojCheck[0] < clipBounds[0][0] ||
            reprojCheck[0] > clipBounds[1][0] ||
            reprojCheck[1] < clipBounds[0][1] ||
            reprojCheck[1] > clipBounds[1][1])
        ) {
          return;
        }
      }

      // For projections with a meaningful clip angle, reject points beyond the boundary
      const clipAngle = proj.clipAngle?.();
      if (clipAngle != null && clipAngle > 0 && clipAngle < 170) {
        const rotation = proj.rotate();
        const centerLon = -rotation[0];
        const centerLat = -rotation[1];
        const toRad = Math.PI / 180;
        const cosD =
          Math.sin(centerLat * toRad) * Math.sin(lat * toRad) +
          Math.cos(centerLat * toRad) *
            Math.cos(lat * toRad) *
            Math.cos((lon - centerLon) * toRad);
        if (cosD < Math.cos(clipAngle * toRad)) {
          return;
        }
      }

      // Round-trip check: reject false inversions in projection gaps
      // (e.g. between lobes of Berghaus Star or Interrupted Homolosine)
      const reprojected = proj([lon, lat]);
      if (!reprojected) {
        return;
      }
      const dx = reprojected[0] - x;
      const dy = reprojected[1] - y;
      if (dx * dx + dy * dy > 4) {
        return;
      }

      setCoords([lon, lat]);
      drawIndicatrix(lon, lat);
    },
    [drawIndicatrix],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') {
        isTouchingRef.current = true;
        handlePointer(e);
      }
    },
    [handlePointer],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') {
        isTouchingRef.current = false;
      }
    },
    [],
  );

  return (
    <div
      className="map-container"
      ref={containerRef}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointer}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={(e) => {
        // On touch, pointerleave fires on finger lift — keep the indicatrix visible
        if (e.pointerType === 'touch') return;
        clearIndicatrix();
      }}
    >
      <svg ref={svgRef} />
<InfoPanel coords={coords} tissot={tissot} />
    </div>
  );
}
