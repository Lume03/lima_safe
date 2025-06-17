import type { District, Connection, PathResult, PathSegment } from '@/types';

interface Graph {
  [key: string]: { [key: string]: { distance: number; danger: number } };
}

// MinHeap implementation for Dijkstra's algorithm
class MinHeap {
  private heap: Array<{ id: string; cost: number }> = [];
  private positions: Map<string, number> = new Map(); // To keep track of node positions for updates

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  insert(id: string, cost: number): void {
    this.heap.push({ id, cost });
    this.positions.set(id, this.heap.length - 1);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): { id: string; cost: number } | null {
    if (this.isEmpty()) return null;

    const min = this.heap[0];
    const last = this.heap.pop();

    this.positions.delete(min.id);

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.positions.set(last.id, 0);
      this.siftDown(0);
    }
    return min;
  }
  
  decreaseKey(id: string, newCost: number): void {
    const index = this.positions.get(id);
    if (index === undefined) return; // Should not happen if node is in heap

    if (this.heap[index].cost > newCost) {
        this.heap[index].cost = newCost;
        this.siftUp(index);
    }
  }


  private siftUp(index: number): void {
    let parentIndex = Math.floor((index - 1) / 2);
    while (index > 0 && this.heap[index].cost < this.heap[parentIndex].cost) {
      this.swap(index, parentIndex);
      index = parentIndex;
      parentIndex = Math.floor((index - 1) / 2);
    }
  }

  private siftDown(index: number): void {
    let smallest = index;
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;

    if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].cost < this.heap[smallest].cost) {
      smallest = leftChildIndex;
    }
    if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].cost < this.heap[smallest].cost) {
      smallest = rightChildIndex;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.siftDown(smallest);
    }
  }

  private swap(i: number, j: number): void {
    this.positions.set(this.heap[i].id, j);
    this.positions.set(this.heap[j].id, i);
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}


// Dijkstra's Algorithm - Simple O(V^2) version
export function dijkstraSimple(
  districts: District[],
  connections: Connection[],
  originId: string,
  destinationId: string,
  alpha: number, 
  beta: number   
): PathResult | null {
  if (!districts.length) return null;

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
  return reconstructPath(originId, destinationId, parents, costs, districtMap, connections, alpha, beta);
}


// Dijkstra's Algorithm with MinHeap - O((V+E)logV) version
export function dijkstraWithHeap(
  districts: District[],
  connections: Connection[],
  originId: string,
  destinationId: string,
  alpha: number, 
  beta: number   
): PathResult | null {
  if (!districts.length) return null;

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
  const minHeap = new MinHeap();

  districts.forEach(district => {
    costs[district.id] = Infinity;
    parents[district.id] = null;
  });

  costs[originId] = 0;
  minHeap.insert(originId, 0);
  
  // Initialize heap with all nodes, origin with 0, others with Infinity
  // This is one way, or only insert origin and then others as they are discovered/updated.
  // For simplicity of decreaseKey, let's initialize all.
  districts.forEach(district => {
    if (district.id !== originId) {
      minHeap.insert(district.id, Infinity);
    }
  });


  while (!minHeap.isEmpty()) {
    const currentHeapNode = minHeap.extractMin();
    if (!currentHeapNode) break;

    const { id: u, cost: costU } = currentHeapNode;

    // If costU is Infinity, it means remaining nodes are unreachable.
    if (costU === Infinity) break; 
    
    // Optimization: If we've already found a shorter path to u, skip.
    // This is relevant if not using a heap that supports efficient decreaseKey and instead re-inserts.
    // Our current heap has decreaseKey, so this check is less critical but good for robustness.
    if (costU > costs[u]) continue;


    const neighbors = graph[u];
    if (neighbors) {
      for (const v in neighbors) {
        const edge = neighbors[v];
        const weightedCost = alpha * edge.distance + beta * edge.danger;
        const newCostToV = costs[u] + weightedCost;

        if (newCostToV < costs[v]) {
          costs[v] = newCostToV;
          parents[v] = u;
          minHeap.decreaseKey(v, newCostToV);
        }
      }
    }
     if (u === destinationId) break; // Optimization: stop if destination is reached
  }
  return reconstructPath(originId, destinationId, parents, costs, districtMap, connections, alpha, beta);
}


// Helper function to reconstruct path - used by both Dijkstra versions
function reconstructPath(
    originId: string,
    destinationId: string,
    parents: { [key: string]: string | null },
    costs: { [key: string]: number },
    districtMap: Map<string, District>,
    connections: Connection[],
    alpha: number,
    beta: number
): PathResult | null {
    const pathNodeIds: string[] = [];
    let current = destinationId;

    // Handle case where destination is unreachable or is the origin
    if (costs[destinationId] === Infinity && originId !== destinationId) return null;
    
    if (originId === destinationId) {
      const originNode = districtMap.get(originId);
      return originNode ? {
        pathNodes: [originNode],
        segments: [],
        totalDistance: 0,
        totalDangerScore: 0,
        totalWeightedCost: 0,
      } : null;
    }

    while (current && parents[current] !== undefined) { // Check parents[current] !== undefined to ensure it's part of discovered path
        pathNodeIds.unshift(current);
        if (current === originId) break; // Stop if we traced back to origin
        const parent = parents[current];
        if (!parent) { // Path is broken if no parent before reaching origin
             return null; 
        }
        current = parent;
    }
    
    // If pathNodeIds doesn't start with originId after loop (e.g. only destinationId was added, or path is broken)
    if (pathNodeIds.length === 0 || pathNodeIds[0] !== originId) {
        // This might happen if destination is origin, handled above, or if no path.
        // If originId was never added to pathNodeIds (e.g., destination was unreachable and pathNodeIds became empty)
        if (costs[destinationId] === Infinity) return null;
        // if pathNodeIds is not empty but doesn't start with origin, this is an issue.
        // but the while loop condition should prevent infinite loops or bad states.
        // The most common case for this check failing is destinationId being unreachable
    }


    const pathNodes = pathNodeIds.map(id => districtMap.get(id)!).filter(Boolean);

    if (pathNodes.length === 0 && originId !== destinationId) return null;
    if (pathNodes.length > 0 && pathNodes[0].id !== originId && originId !== destinationId) return null;
    if (pathNodes.length === 0 && originId === destinationId) { // Should be caught by initial check
        const originNode = districtMap.get(originId);
        return originNode ? { pathNodes: [originNode], segments: [], totalDistance: 0, totalDangerScore: 0, totalWeightedCost: 0 } : null;
    }


    let totalDistance = 0;
    let totalDangerScore = 0;
    const segments: PathSegment[] = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
        const fromNode = pathNodes[i];
        const toNode = pathNodes[i + 1];
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
        } else {
             // This case means there's a discrepancy between Dijkstra's graph and connection data or path reconstruction error
             console.error(`Error: No direct connection found in data for segment ${fromNode.name} -> ${toNode.name} during path reconstruction.`);
             // return null; // Or handle more gracefully depending on desired behavior
        }
    }
    
    if (costs[destinationId] === Infinity) return null;


    return {
        pathNodes,
        segments,
        totalDistance,
        totalDangerScore,
        totalWeightedCost: costs[destinationId] === Infinity ? 0 : costs[destinationId], // Ensure not Infinity for display
    };
}


function findLowestCostNode(costs: { [key: string]: number }, processed: string[]): string | null {
  let lowestCost = Infinity;
  let lowestCostNode: string | null = null;

  for (const node in costs) {
    if (costs.hasOwnProperty(node)) { // Ensure it's not a prototype property
        const cost = costs[node];
        if (cost < lowestCost && !processed.includes(node)) {
        lowestCost = cost;
        lowestCostNode = node;
        }
    }
  }
  return lowestCostNode;
}

export function getDangerColor(dangerLevel: number): string {
  if (dangerLevel <= 1) return '#4CAF50'; // Green
  if (dangerLevel <= 2) return '#8BC34A'; // Light Green
  if (dangerLevel <= 3) return '#FFEB3B'; // Yellow
  if (dangerLevel <= 4) return '#FF9800'; // Orange
  return '#F44336'; // Red for 5 and above (or default)
}

export function getDangerStrokeWeight(dangerLevel: number): number {
  if (dangerLevel <= 1) return 4;
  if (dangerLevel <= 2) return 5;
  if (dangerLevel <= 3) return 6;
  if (dangerLevel <= 4) return 7;
  return 8; // For 5 and above
}
