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
}

const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';

export function MapCanvas({ projectionIndex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const projectionRef = useRef<GeoProjection | null>(null);
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
    const marginX = w * 0.075;
    const marginTop = h * 0.05;
    const marginBottom = h * 0.1;
    const availH = h - infoPanelHeight;
    proj.fitExtent(
      [
        [marginX, marginTop],
        [w - marginX, availH - marginBottom],
      ],
      { type: 'Sphere' },
    );
    projectionRef.current = proj;

    const path = d3.geoPath(proj);
    const root = select(svg);

    // Clear and rebuild
    root.selectAll('*').remove();

    // Build clip path from sphere outline
    const defs = root.append('defs');
    const outlinePath = path({ type: 'Sphere' }) ?? '';
    defs
      .append('clipPath')
      .attr('id', 'projection-clip')
      .append('path')
      .attr('d', outlinePath);

    // Outline (ocean)
    root
      .append('path')
      .attr('d', outlinePath)
      .attr('fill', 'var(--ocean)')
      .attr('stroke', 'var(--outline)')
      .attr('stroke-width', 1.5);

    // Clipped group for graticule, land, and indicatrix
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

    // Indicatrix group (inside clipped group)
    clipped
      .append('g')
      .attr('class', 'indicatrix-layer');
  }, [projectionIndex]);

  // Re-render on projection change or world load
  useEffect(() => {
    renderMap();
  }, [renderMap]);

  // Resize handler
  useEffect(() => {
    const onResize = () => renderMap();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
      const scale = maxAxis > 0 ? baseRadius / maxAxis : 1;

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
    [],
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
        clearIndicatrix();
        return;
      }

      const [lon, lat] = inverted;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        clearIndicatrix();
        return;
      }

      // Round-trip check: reject false inversions in projection gaps
      // (e.g. between lobes of Berghaus Star or Interrupted Homolosine)
      const reprojected = proj([lon, lat]);
      if (!reprojected) {
        clearIndicatrix();
        return;
      }
      const dx = reprojected[0] - x;
      const dy = reprojected[1] - y;
      if (dx * dx + dy * dy > 4) {
        clearIndicatrix();
        return;
      }

      setCoords([lon, lat]);
      drawIndicatrix(lon, lat);
    },
    [drawIndicatrix, clearIndicatrix],
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
