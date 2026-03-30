declare module 'd3-geo-projection' {
  import type { GeoProjection } from 'd3-geo';
  export function geoMollweide(): GeoProjection;
  export function geoRobinson(): GeoProjection;
  export function geoEckert4(): GeoProjection;
  export function geoSinusoidal(): GeoProjection;
  export function geoBerghaus(): GeoProjection;
  export function geoInterruptedHomolosine(): GeoProjection;
}
