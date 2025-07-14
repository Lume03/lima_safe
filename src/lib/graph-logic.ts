import type { GraphNode, GraphEdge, GraphData, PathResult, LatLng } from '@/types';

// MinHeap implementation for Dijkstra's algorithm
class MinHeap {
  private heap: Array<{ id: string; cost: number }> = [];
  private positions: Map<string, number> = new Map();

  isEmpty = (): boolean => this.heap.length === 0;

  insert(id: string, cost: number): void {
    this.heap.push({ id, cost });
    this.positions.set(id, this.heap.length - 1);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): { id: string; cost: number } | null {
    if (this.isEmpty()) return null;

    this.swap(0, this.heap.length - 1);
    const min = this.heap.pop();
    if (min) {
        this.positions.delete(min.id);
    }
    
    if (this.heap.length > 0) {
      this.siftDown(0);
    }
    return min || null;
  }
  
  decreaseKey(id: string, newCost: number): void {
    const index = this.positions.get(id);
    if (index === undefined) {
        // If the node is not in the heap, insert it. This can happen if we don't pre-populate.
        this.insert(id, newCost);
        return;
    }

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
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
    this.positions.set(this.heap[i].id, i);
    this.positions.set(this.heap[j].id, j);
  }
}


export class Graph {
    nodes = new Map<string, GraphNode>();
    private adjacencyList = new Map<string, GraphEdge[]>();

    constructor(data: GraphData) {
        data.nodes.forEach(node => {
            this.nodes.set(node.id, { ...node, edges: [] });
            this.adjacencyList.set(node.id, []);
        });

        data.edges.forEach(edge => {
            const sourceNode = this.nodes.get(edge.source);
            const targetNode = this.nodes.get(edge.target);
            if (sourceNode && targetNode) {
                const forwardEdge: GraphEdge = { source: edge.source, target: edge.target, length: edge.length, peligrosidad: edge.peligrosidad };
                this.adjacencyList.get(edge.source)?.push(forwardEdge);
                sourceNode.edges.push(forwardEdge);
            }
        });
    }

    getAdjacencyList(nodeId: string): GraphEdge[] {
        return this.adjacencyList.get(nodeId) || [];
    }

    findNearestNode(lat: number, lon: number): GraphNode {
        let nearestNode: GraphNode | null = null;
        let minDistance = Infinity;

        for (const node of this.nodes.values()) {
            const dist = Math.sqrt(Math.pow(node.lat - lat, 2) + Math.pow(node.lon - lon, 2));
            if (dist < minDistance) {
                minDistance = dist;
                nearestNode = node;
            }
        }
        if (!nearestNode) throw new Error("No nodes in graph");
        return nearestNode;
    }
}

function runDijkstra(graph: Graph, startId: string, endId: string, distanceWeight: number, safetyWeight: number, useHeap: boolean): PathResult | null {
    const costs: { [key: string]: number } = {};
    const parents: { [key: string]: string | null } = {};
    const processed = new Set<string>();

    graph.nodes.forEach(node => {
        costs[node.id] = Infinity;
        parents[node.id] = null;
    });

    costs[startId] = 0;
    
    let priorityQueue: MinHeap | null = null;
    if (useHeap) {
        priorityQueue = new MinHeap();
        // Insert only the start node initially. Other nodes will be added as they are discovered.
        priorityQueue.insert(startId, 0);
    }
    
    let visitedNodesCount = 0;

    while (true) {
        let currentNodeId: string | null = null;

        if (useHeap && priorityQueue) {
            const minNode = priorityQueue.extractMin();
            if (!minNode || minNode.cost === Infinity) break;
            currentNodeId = minNode.id;
        } else {
             // Simple O(V^2) version: find lowest cost node among unprocessed
            let lowestCost = Infinity;
            currentNodeId = null;
            for (const nodeId of graph.nodes.keys()) {
                if (costs[nodeId] < lowestCost && !processed.has(nodeId)) {
                    lowestCost = costs[nodeId];
                    currentNodeId = nodeId;
                }
            }
            if (currentNodeId === null || lowestCost === Infinity) break;
        }

        if (processed.has(currentNodeId)) continue;
        
        visitedNodesCount++;
        processed.add(currentNodeId);

        if (currentNodeId === endId) break;

        graph.getAdjacencyList(currentNodeId).forEach(edge => {
            const weight = edge.length * distanceWeight + edge.peligrosidad * safetyWeight;
            const newCost = costs[currentNodeId!] + weight;

            if (newCost < costs[edge.target]) {
                costs[edge.target] = newCost;
                parents[edge.target] = currentNodeId;
                if (useHeap && priorityQueue) {
                    priorityQueue.decreaseKey(edge.target, newCost);
                }
            }
        });
    }

    if (costs[endId] === Infinity) return null;

    const path: GraphNode[] = [];
    let current: string | null = endId;
    while (current) {
        path.unshift(graph.nodes.get(current)!);
        current = parents[current];
    }
    
    if (path.length === 0 || path[0].id !== startId) return null;

    let totalLength = 0;
    let totalPeligrosidad = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = path[i];
        const toNode = path[i + 1];
        const edge = fromNode.edges.find(e => e.target === toNode.id);
        if (edge) {
            totalLength += edge.length;
            totalPeligrosidad += edge.peligrosidad;
        }
    }

    return {
        path,
        totalLength,
        totalPeligrosidad,
        totalCost: costs[endId],
        visitedNodes: visitedNodesCount,
        algorithm: useHeap ? 'heap' : 'simple',
        executionTime: 0 // This will be calculated outside
    };
}

export const dijkstra = (graph: Graph, startId: string, endId: string, distanceWeight: number, safetyWeight: number) => 
    runDijkstra(graph, startId, endId, distanceWeight, safetyWeight, false);

export const dijkstraHeap = (graph: Graph, startId: string, endId: string, distanceWeight: number, safetyWeight: number) => 
    runDijkstra(graph, startId, endId, distanceWeight, safetyWeight, true);


export function getDangerColor(dangerLevel: number): string {
  if (dangerLevel <= 1.5) return '#4CAF50'; // Green
  if (dangerLevel <= 2.5) return '#8BC34A'; // Light Green
  if (dangerLevel <= 3.5) return '#FFEB3B'; // Yellow
  if (dangerLevel <= 4.5) return '#FF9800'; // Orange
  return '#F44336'; // Red for > 4.5
}

export function getDangerStrokeWeight(dangerLevel: number): number {
  if (dangerLevel <= 2) return 5;
  if (dangerLevel <= 4) return 6;
  return 7;
}
