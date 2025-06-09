export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Connection {
  id: string;
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
