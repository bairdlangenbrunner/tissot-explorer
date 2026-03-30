import * as d3 from 'd3-geo';
import * as d3Proj from 'd3-geo-projection';
import type { GeoProjection } from 'd3-geo';

export interface ProjectionDef {
  name: string;
  fn: () => GeoProjection;
  /** Conic projections extend to infinity at the opposite pole; fitExtent must use a bounded region */
  conic?: boolean;
}

export interface ProjectionGroup {
  label: string;
  description: string;
  projections: ProjectionDef[];
}

export const projectionGroups: ProjectionGroup[] = [
  {
    label: 'Conformal',
    description: 'preserves local shapes',
    projections: [
      { name: 'Mercator', fn: () => d3.geoMercator().precision(0.1) },
      {
        name: 'Transverse Mercator',
        fn: () => d3.geoTransverseMercator().precision(0.1),
      },
      {
        name: 'Stereographic',
        fn: () => d3.geoStereographic().precision(0.1).clipAngle(140),
      },
      {
        name: 'Lambert Conformal Conic',
        fn: () => d3.geoConicConformal().precision(0.1).parallels([30, 60]),
        conic: true,
      },
    ],
  },
  {
    label: 'Equal-area',
    description: 'preserves relative area',
    projections: [
      { name: 'Mollweide', fn: () => d3Proj.geoMollweide().precision(0.1) },
      { name: 'Hammer', fn: () => d3Proj.geoHammer().precision(0.1) },
      { name: 'Sinusoidal', fn: () => d3Proj.geoSinusoidal().precision(0.1) },
      { name: 'Eckert IV', fn: () => d3Proj.geoEckert4().precision(0.1) },
      {
        name: 'Conic Equal-Area',
        fn: () => d3.geoConicEqualArea().precision(0.1).parallels([20, 60]),
        conic: true,
      },
      {
        name: 'Azimuthal Equal-Area',
        fn: () => d3.geoAzimuthalEqualArea().precision(0.1),
      },
      {
        name: 'Interrupted Goode Homolosine',
        fn: () => d3Proj.geoInterruptedHomolosine().precision(0.1),
      },
    ],
  },
  {
    label: 'Compromise',
    description: 'balances shape and area',
    projections: [
      { name: 'Robinson', fn: () => d3Proj.geoRobinson().precision(0.1) },
      {
        name: 'Winkel Tripel',
        fn: () => d3Proj.geoWinkel3().precision(0.1),
      },
      {
        name: 'Natural Earth',
        fn: () => d3.geoNaturalEarth1().precision(0.1),
      },
      { name: 'Aitoff', fn: () => d3Proj.geoAitoff().precision(0.1) },
    ],
  },
  {
    label: 'Equidistant',
    description: 'preserves distances along certain lines',
    projections: [
      {
        name: 'Equirectangular',
        fn: () => d3.geoEquirectangular().precision(0.1),
      },
      {
        name: 'Conic Equidistant',
        fn: () => d3.geoConicEquidistant().precision(0.1).parallels([20, 60]),
        conic: true,
      },
    ],
  },
  {
    label: 'Azimuthal',
    description: 'preserves directions from center',
    projections: [
      {
        name: 'Globe (orthographic)',
        fn: () => d3.geoOrthographic().precision(0.1).clipAngle(90),
      },
      {
        name: 'Gnomonic',
        fn: () => d3.geoGnomonic().precision(0.1).clipAngle(60),
      },
    ],
  },
  {
    label: 'Other',
    description: 'just kinda cool',
    projections: [
      {
        name: 'Van der Grinten',
        fn: () => d3Proj.geoVanDerGrinten().precision(0.1),
      },
      { name: 'Baker', fn: () => d3Proj.geoBaker().precision(0.1) },
      { name: 'Lagrange', fn: () => d3Proj.geoLagrange().precision(0.1) },
      { name: 'August', fn: () => d3Proj.geoAugust().precision(0.1) },
      { name: 'Armadillo', fn: () => d3Proj.geoArmadillo().precision(0.1) },
      { name: 'Collignon', fn: () => d3Proj.geoCollignon().precision(0.1) },
      { name: 'Eisenlohr', fn: () => d3Proj.geoEisenlohr().precision(0.1) },
      { name: 'Gingery', fn: () => d3Proj.geoGingery().precision(0.1) },
      {
        name: 'Peirce Quincuncial',
        fn: () => d3Proj.geoPeirceQuincuncial().precision(0.1),
      },
      {
        name: 'Berghaus Star',
        fn: () => d3Proj.geoBerghaus().precision(0.1),
      },
    ],
  },
];

// Flat list for index-based access (used by MapCanvas and App)
export const projections: ProjectionDef[] = projectionGroups.flatMap(
  (g) => g.projections
);
