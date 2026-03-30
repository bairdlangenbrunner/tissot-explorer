import * as d3 from 'd3-geo';
import * as d3Proj from 'd3-geo-projection';
import type { GeoProjection } from 'd3-geo';

export interface ProjectionDef {
  name: string;
  fn: () => GeoProjection;
}

export const projections: ProjectionDef[] = [
  {
    name: 'Globe',
    fn: () => d3.geoOrthographic().precision(0.1).clipAngle(90),
  },
  { name: 'Mercator', fn: () => d3.geoMercator().precision(0.1) },
  {
    name: 'Equirectangular',
    fn: () => d3.geoEquirectangular().precision(0.1),
  },
  { name: 'Mollweide', fn: () => d3Proj.geoMollweide().precision(0.1) },
  { name: 'Robinson', fn: () => d3Proj.geoRobinson().precision(0.1) },
  { name: 'Eckert IV', fn: () => d3Proj.geoEckert4().precision(0.1) },
  {
    name: 'Azimuthal Equal-Area',
    fn: () => d3.geoAzimuthalEqualArea().precision(0.1),
  },
  {
    name: 'Stereographic',
    fn: () => d3.geoStereographic().precision(0.1).clipAngle(140),
  },
  {
    name: 'Gnomonic',
    fn: () => d3.geoGnomonic().precision(0.1).clipAngle(60),
  },
  {
    name: 'Conic Equidistant',
    fn: () => d3.geoConicEquidistant().precision(0.1).parallels([20, 60]),
  },
  { name: 'Natural Earth', fn: () => d3.geoNaturalEarth1().precision(0.1) },
  { name: 'Sinusoidal', fn: () => d3Proj.geoSinusoidal().precision(0.1) },
  {
    name: 'Berghaus Star',
    fn: () => d3Proj.geoBerghaus().precision(0.1).clipAngle(180 - 1e-3),
  },
  {
    name: 'Interrupted Goode Homolosine',
    fn: () => d3Proj.geoInterruptedHomolosine().precision(0.1),
  },
];
