export interface LatLng {
  lat: number;
  lng: number;
}

export interface GraphNode {
  id: string;
  lat: number;
  lon: number;
  edges: GraphEdge[]; // For easier access to edge data
}

export interface GraphEdge {
  source: string;
  target: string;
  length: number; // in meters
  peligrosidad: number; // 1-5 (1 = safest, 5 = most dangerous)
}

export interface GraphData {
  nodes: { id: string; lat: number; lon: number }[];
  edges: GraphEdge[];
}

export interface PathResult {
  path: GraphNode[];
  totalLength: number;
  totalPeligrosidad: number;
  totalCost: number;
  visitedNodes: number;
  algorithm: 'simple' | 'heap';
  executionTime: number;
}
