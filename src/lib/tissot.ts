import type { GeoProjection } from 'd3-geo';

export interface TissotResult {
  center: [number, number];
  a: number;
  b: number;
  angle: number;
  h: number;
  k: number;
  areaScale: number;
  omega: number;
}

export function tissotAtPoint(
  projection: GeoProjection,
  lon: number,
  lat: number,
): TissotResult | null {
  const eps = 0.0001;

  const center = projection([lon, lat]);
  if (!center) return null;

  const latN = Math.min(lat + eps, 89.99);
  const latS = Math.max(lat - eps, -89.99);
  const lonE = lon + eps;
  const lonW = lon - eps;

  const pLatN = projection([lon, latN]);
  const pLatS = projection([lon, latS]);
  const pLonE = projection([lonE, lat]);
  const pLonW = projection([lonW, lat]);

  if (!pLatN || !pLatS || !pLonE || !pLonW) return null;

  // Detect discontinuities (e.g. interrupted projections where neighboring
  // points project to different lobes, producing enormous derivative jumps)
  const maxPixelJump = 1;
  if (
    Math.abs(pLonE[0] - pLonW[0]) > maxPixelJump ||
    Math.abs(pLonE[1] - pLonW[1]) > maxPixelJump ||
    Math.abs(pLatN[0] - pLatS[0]) > maxPixelJump ||
    Math.abs(pLatN[1] - pLatS[1]) > maxPixelJump
  ) {
    return null;
  }

  const dLatRad = ((latN - latS) * Math.PI) / 180;
  const dLonRad = ((2 * eps) * Math.PI) / 180;
  const cosLat = Math.cos((lat * Math.PI) / 180);

  const dxdlam = (pLonE[0] - pLonW[0]) / (dLonRad * cosLat);
  const dydlam = (pLonE[1] - pLonW[1]) / (dLonRad * cosLat);
  const dxdphi = (pLatN[0] - pLatS[0]) / dLatRad;
  const dydphi = (pLatN[1] - pLatS[1]) / dLatRad;

  const h = Math.sqrt(dxdphi * dxdphi + dydphi * dydphi);
  const k = Math.sqrt(dxdlam * dxdlam + dydlam * dydlam);

  const sinTheta = (dxdphi * dydlam - dydphi * dxdlam) / (h * k);
  const clampedSin = Math.max(-1, Math.min(1, sinTheta));

  const ap = Math.sqrt(h * h + k * k + 2 * h * k * Math.abs(clampedSin));
  const bp = Math.sqrt(h * h + k * k - 2 * h * k * Math.abs(clampedSin));
  const a = (ap + bp) / 2;
  const b = (ap - bp) / 2;

  const areaScale = h * k * Math.abs(clampedSin);
  const s = projection.scale();
  const areaScaleNorm = areaScale / (s * s);

  const E = dxdphi * dxdphi + dxdlam * dxdlam;
  const G = dydphi * dydphi + dydlam * dydlam;
  const F = dxdphi * dydphi + dxdlam * dydlam;
  // When the ellipse is nearly circular, the orientation is undefined and
  // atan2(≈0, ≈0) produces numerically unstable jitter — snap to 0.
  const eccentricity = Math.abs(a - b) / Math.max(a, b, 1e-12);
  const angle = eccentricity < 0.01 ? 0 : 0.5 * Math.atan2(2 * F, E - G);

  const omega =
    (Math.acos(Math.max(-1, Math.min(1, (2 * a * b) / (a * a + b * b)))) *
      180) /
    Math.PI;

  return {
    center: [center[0], center[1]],
    a,
    b,
    angle,
    h,
    k,
    areaScale: areaScaleNorm,
    omega,
  };
}
