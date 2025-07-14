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


/**
 * DIJKSTRA SIMPLE - ANÁLISIS
 */
function dijkstraSimple(graph: Graph, startId: string, endId: string, distanceWeight: number, safetyWeight: number): PathResult | null {
    /**
     * PASO 1: INICIALIZACIÓN
     * Costo Total de esta sección: O(V)
     * Se ejecuta una sola vez al principio para preparar las estructuras.
     */
    const costs: { [key: string]: number } = {};
    const parents: { [key: string]: string | null } = {};
    const processed = new Set<string>();
    let visitedNodesCount = 0;

    // Este bucle recorre todos los nodos una vez. Costo: O(V).
    graph.nodes.forEach(node => {
        costs[node.id] = Infinity;
        parents[node.id] = null;
    });

    // Operación de costo O(1).
    costs[startId] = 0;

    /**
     * PASO 2: BUCLE PRINCIPAL
     * Costo Total de toda la sección del bucle: O(V^2)
     * El bucle se ejecuta V veces en el peor de los casos.
     */
    while (true) {
        /**
         * PASO 3: SELECCIÓN DEL NODO (Búsqueda Manual)
         * Costo por iteración del while: O(V).
         * Costo Acumulado de esta sección: O(V^2) (V iteraciones * O(V) por búsqueda).
         * Este es el cuello de botella del algoritmo.
         */
        let lowestCost = Infinity;
        let currentNodeId: string | null = null;
        
        for (const nodeId of graph.nodes.keys()) {
            if (costs[nodeId] < lowestCost && !processed.has(nodeId)) {
                lowestCost = costs[nodeId];
                currentNodeId = nodeId;
            }
        }

        // Operaciones de costo O(1).
        if (currentNodeId === null) break;

        /**
         * PASO 4: PROCESAMIENTO DEL NODO ACTUAL
         * Costo por iteración: O(1).
         */
        processed.add(currentNodeId);
        visitedNodesCount++; 
        
        if (currentNodeId === endId) break;

        /**
         * PASO 5: ACTUALIZACIÓN DE VECINOS ("RELAJACIÓN")
         * Costo Acumulado Total de esta sección: O(E).
         * A lo largo de todo el algoritmo, cada arista se revisa una sola vez.
         */
        graph.getAdjacencyList(currentNodeId).forEach(edge => {
            // Todas las operaciones aquí dentro son de costo O(1).
            const weight = edge.length * distanceWeight + edge.peligrosidad * safetyWeight;
            const newCost = costs[currentNodeId!] + weight;

            if (newCost < costs[edge.target]) {
                costs[edge.target] = newCost;
                parents[edge.target] = currentNodeId;
            }
        });
    }

    /**
     * PASO 6: RECONSTRUCCIÓN Y CÁLCULO FINAL
     * Costo Total de esta sección: O(V) en el peor caso.
     */
    if (costs[endId] === Infinity) return null;

    const path: GraphNode[] = [];
    let current: string | null = endId;
    // Este bucle recorre el camino más largo (puede tener V nodos). Costo: O(V).
    while (current) {
        path.unshift(graph.nodes.get(current)!);
        current = parents[current];
    }
    
    let totalLength = 0;
    let totalPeligrosidad = 0;
    // Este bucle también recorre el camino. Costo: O(V) en el peor caso.
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = path[i];
        const toNode = path[i + 1];
        const edge = fromNode.edges.find(e => e.target === toNode.id);
        if (edge) {
            totalLength += edge.length;
            totalPeligrosidad += edge.peligrosidad;
        }
    }

    // Suma final de costos: O(V) + O(V^2) + O(E) + O(V) => El término dominante es O(V^2).
    return {
        path,
        totalLength,
        totalPeligrosidad,
        totalCost: costs[endId],
        visitedNodes: visitedNodesCount,
        algorithm: 'simple',
        executionTime: 0
    };
}

/**
 * DIJKSTRA OPTIMIZADO CON HEAP
 */
function dijkstraConHeap(graph: Graph, startId: string, endId: string, distanceWeight: number, safetyWeight: number): PathResult | null {
    /**
     * PASO 1: INICIALIZACIÓN
     * Costo Total de esta sección: O(V)
     */
    const costs: { [key: string]: number } = {};
    const parents: { [key: string]: string | null } = {};
    const processed = new Set<string>();
    const priorityQueue = new MinHeap();
    let visitedNodesCount = 0;

    // Costo: O(V).
    graph.nodes.forEach(node => {
        costs[node.id] = Infinity;
        parents[node.id] = null;
    });

    // Costo O(1).
    costs[startId] = 0;
    // La inserción en el heap cuesta O(log V).
    priorityQueue.insert(startId, 0);

    /**
     * PASO 2: BUCLE PRINCIPAL
     * El bucle se ejecuta V veces (una por cada nodo que se extrae del heap).
     */
    while (!priorityQueue.isEmpty()) {
        /**
         * PASO 3: SELECCIÓN DEL NODO (Optimizado con Heap)
         * Costo por iteración: O(log V).
         * Costo Acumulado de todas las extracciones: O(V log V).
         */
        const minNode = priorityQueue.extractMin();

        // Operaciones de costo O(1).
        if (!minNode || minNode.cost === Infinity) break;
        const currentNodeId = minNode.id;

        /**
         * PASO 4: PROCESAMIENTO DEL NODO ACTUAL
         * Costo por iteración: O(1).
         */
        if (processed.has(currentNodeId)) continue;
        processed.add(currentNodeId);
        visitedNodesCount++;
        
        if (currentNodeId === endId) break;

        /**
         * PASO 5: ACTUALIZACIÓN DE VECINOS ("RELAJACIÓN")
         * Costo Acumulado Total de esta sección: O(E log V).
         */
        graph.getAdjacencyList(currentNodeId).forEach(edge => {
            const weight = edge.length * distanceWeight + edge.peligrosidad * safetyWeight;
            const newCost = costs[currentNodeId] + weight;

            if (newCost < costs[edge.target]) {
                costs[edge.target] = newCost;
                parents[edge.target] = currentNodeId;
                
                // Se notifica al heap del nuevo costo.
                // Esta operación cuesta O(log V) cada vez que se llama.
                // En total, se puede llamar hasta E veces, costando O(E log V).
                priorityQueue.decreaseKey(edge.target, newCost);
            }
        });
    }

    /**
     * PASO 6: RECONSTRUCCIÓN Y CÁLCULO FINAL
     * Costo Total de esta sección: O(V) en el peor caso.
     */
    if (costs[endId] === Infinity) return null;

    const path: GraphNode[] = [];
    let current: string | null = endId;
    // Costo: O(V).
    while (current) {
        path.unshift(graph.nodes.get(current)!);
        current = parents[current];
    }
    
    let totalLength = 0;
    let totalPeligrosidad = 0;
    // Costo: O(V) en el peor caso.
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = path[i];
        const toNode = path[i + 1];
        const edge = fromNode.edges.find(e => e.target === toNode.id);
        if (edge) {
            totalLength += edge.length;
            totalPeligrosidad += edge.peligrosidad;
        }
    }

    // Suma final de costos: O(V) + O(V log V) + O(E log V) + O(V) 
    // Los términos dominantes son O(V log V) y O(E log V).
    // El resultado es O((V+E) log V).
    return {
        path,
        totalLength,
        totalPeligrosidad,
        totalCost: costs[endId],
        visitedNodes: visitedNodesCount,
        algorithm: 'heap',
        executionTime: 0
    };
}