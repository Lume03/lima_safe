
export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Connection {
  id:string;
  from: string;
  to: string;
  distance: number; // in kilometers
  danger: number; // 1-5 (1 = safest, 5 = most dangerous)
}

export interface PathSegment {
  from: District;
  to: District;
  distance: number;
  danger: number;
  weightedCost: number;
}

export interface PathResult {
  pathNodes: District[];
  segments: PathSegment[];
  totalDistance: number;
  totalDangerScore: number; // Sum of danger values of edges in the path
  totalWeightedCost: number;
}

export interface LimaData {
  districts: District[];
  connections: Connection[];
}

// Removed VisGlPolylineProps re-export as MapComponent now uses a local simplified type.
// If other components were using VisGlPolylineProps from here, this might need to be preserved,
// but for now, MapComponent is the primary consumer of Polyline-related types.
// export type { PolylineProps as VisGlPolylineProps } from '@vis.gl/react-google-maps';
