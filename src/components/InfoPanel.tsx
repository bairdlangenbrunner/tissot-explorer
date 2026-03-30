import type { TissotResult } from '../lib/tissot';

interface Props {
  coords: [number, number] | null;
  tissot: TissotResult | null;
}

function formatCoords(lon: number, lat: number): string {
  const latStr = `${Math.abs(lat).toFixed(1)}\u00b0${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(1)}\u00b0${lon >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lonStr}`;
}

function formatArea(areaScale: number): string {
  const label =
    areaScale > 1.01
      ? '(enlarged)'
      : areaScale < 0.99
        ? '(shrunk)'
        : '(\u2248preserved)';
  return `${areaScale.toFixed(3)}\u00d7 ${label}`;
}

export function InfoPanel({ coords, tissot }: Props) {
  return (
    <div className="info-panel">
      <div className="group">
        <span className="label">Position</span>
        <span className="coord">
          {coords ? formatCoords(coords[0], coords[1]) : '\u2014'}
        </span>
      </div>
      <div className="group">
        <span className="label">Area distortion</span>
        <span className="metric">
          {tissot ? formatArea(tissot.areaScale) : '\u2014'}
        </span>
      </div>
      <div className="group">
        <span className="label">Angular distortion</span>
        <span className="metric">
          {tissot ? `${tissot.omega.toFixed(1)}\u00b0 max` : '\u2014'}
        </span>
      </div>
    </div>
  );
}
