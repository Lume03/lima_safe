import type { District, Connection, PathResult, PathSegment } from '@/types';

interface Graph {
  [key: string]: { [key: string]: { distance: number; danger: number } };
}

export function dijkstra(
  districts: District[],
  connections: Connection[],
  originId: string,
  destinationId: string,
  alpha: number, // distance weight
  beta: number   // safety weight
): PathResult | null {
  if (!districts.length || !connections.length) return null;

  const graph: Graph = {};
  const districtMap = new Map(districts.map(d => [d.id, d]));

  districts.forEach(district => {
    graph[district.id] = {};
  });

  connections.forEach(conn => {
    if (!graph[conn.from]) graph[conn.from] = {};
    graph[conn.from][conn.to] = { distance: conn.distance, danger: conn.danger };
  });

  const costs: { [key: string]: number } = {};
  const parents: { [key: string]: string | null } = {};
  const processed: string[] = [];

  districts.forEach(district => {
    costs[district.id] = Infinity;
    parents[district.id] = null;
  });

  costs[originId] = 0;

  let node = findLowestCostNode(costs, processed);

  while (node) {
    const cost = costs[node];
    const neighbors = graph[node];

    if (neighbors) {
      for (const neighborId in neighbors) {
        const edge = neighbors[neighborId];
        const weightedCost = alpha * edge.distance + beta * edge.danger;
        const newCost = cost + weightedCost;

        if (newCost < costs[neighborId]) {
          costs[neighborId] = newCost;
          parents[neighborId] = node;
        }
      }
    }
    processed.push(node);
    node = findLowestCostNode(costs, processed);
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let current = destinationId;
  while (current && current !== originId) {
    pathNodeIds.unshift(current);
    current = parents[current]!;
  }

  if (!parents[destinationId] && originId !== destinationId) return null; // No path found

  pathNodeIds.unshift(originId);
  
  const pathNodes = pathNodeIds.map(id => districtMap.get(id)!);

  if (pathNodes.some(n => !n)) return null; // Should not happen if logic is correct

  let totalDistance = 0;
  let totalDangerScore = 0;
  const segments: PathSegment[] = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromNode = pathNodes[i];
    const toNode = pathNodes[i+1];
    const connection = connections.find(
      c => (c.from === fromNode.id && c.to === toNode.id)
    );
    if (connection) {
      totalDistance += connection.distance;
      totalDangerScore += connection.danger;
      segments.push({
        from: fromNode,
        to: toNode,
        distance: connection.distance,
        danger: connection.danger,
        weightedCost: alpha * connection.distance + beta * connection.danger,
      });
    }
  }
  
  // Handle case where origin and destination are the same
  if (originId === destinationId && pathNodes.length === 1) {
    return {
      pathNodes,
      segments: [],
      totalDistance: 0,
      totalDangerScore: 0,
      totalWeightedCost: 0,
    };
  }
  
  if (pathNodes.length > 0 && pathNodes[0].id !== originId) return null;


  return {
    pathNodes,
    segments,
    totalDistance,
    totalDangerScore,
    totalWeightedCost: costs[destinationId],
  };
}

function findLowestCostNode(costs: { [key: string]: number }, processed: string[]): string | null {
  let lowestCost = Infinity;
  let lowestCostNode: string | null = null;

  for (const node in costs) {
    const cost = costs[node];
    if (cost < lowestCost && !processed.includes(node)) {
      lowestCost = cost;
      lowestCostNode = node;
    }
  }
  return lowestCostNode;
}

export function getDangerColor(dangerLevel: number): string {
  switch (dangerLevel) {
    case 1: return '#4CAF50'; // Green
    case 2: return '#8BC34A'; // Light Green
    case 3: return '#FFEB3B'; // Yellow
    case 4: return '#FF9800'; // Orange
    case 5: return '#F44336'; // Red
    default: return '#9E9E9E'; // Grey for unknown
  }
}
