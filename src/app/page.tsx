'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import MapComponent from '@/components/MapComponent';
import ControlsPanel from '@/components/ControlsPanel';
import ResultsDisplay from '@/components/ResultsDisplay';
import AlgorithmInfoPanel from '@/components/AlgorithmInfoPanel';

import { Graph, dijkstra, dijkstraHeap } from '@/lib/graph-logic';
import type { GraphNode, PathResult, LatLng, GraphData } from '@/types';
import graphDataJson from '@/data/lima-graph.json';

export default function HomePage() {
  const { toast } = useToast();
  
  const [graphData] = useState<GraphData>(graphDataJson as GraphData);
  const graph = useMemo(() => new Graph(graphData), [graphData]);

  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [startNode, setStartNode] = useState<GraphNode | null>(null);
  const [endNode, setEndNode] = useState<GraphNode | null>(null);
  
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);

  // Use a single state for safety weight (0 to 1). Distance weight will be 1 - safetyWeight.
  const [safetyWeight, setSafetyWeight] = useState(0.5);
  const distanceWeight = 1 - safetyWeight;
  
  const [isSelectingStart, setIsSelectingStart] = useState(true);


  const handleMapClick = useCallback((coords: LatLng) => {
    if (!graph) return;

    const nearestNode = graph.findNearestNode(coords.lat, coords.lng);
    const pointName = isSelectingStart ? 'Origen' : 'Destino';
    const nearestNodeCoords = { lat: nearestNode.lat, lng: nearestNode.lon };

    if (isSelectingStart) {
      setStartPoint(nearestNodeCoords); // Snap marker to the node
      setStartNode(nearestNode);
      if (endNode && nearestNode.id === endNode.id) {
        setEndPoint(null);
        setEndNode(null);
      }
      setIsSelectingStart(false);
    } else {
      if (startNode && nearestNode.id === startNode.id) {
         toast({ title: "Selección Inválida", description: "El destino no puede ser el mismo que el origen.", variant: "destructive" });
         return;
      }
      setEndPoint(nearestNodeCoords); // Snap marker to the node
      setEndNode(nearestNode);
      setIsSelectingStart(true); 
    }
    toast({ title: `${pointName} Seleccionado`, description: `Intersección ID: ${nearestNode.id} establecida.`});
  }, [graph, isSelectingStart, startNode, endNode, toast]);

  const calculatePath = useCallback(async (algorithm: 'simple' | 'heap') => {
    if (!graph || !startNode || !endNode) {
      toast({ title: "Selección Incompleta", description: "Por favor, selecciona un origen y destino en el mapa.", variant: "destructive" });
      return;
    }

    setIsCalculatingPath(true);
    setPathResult(null);

    // Use setTimeout to allow UI to update before blocking thread
    setTimeout(() => {
      try {
        const startTime = performance.now();
        const result = algorithm === 'simple' 
          ? dijkstra(graph, startNode.id, endNode.id, distanceWeight, safetyWeight)
          : dijkstraHeap(graph, startNode.id, endNode.id, distanceWeight, safetyWeight);
        const endTime = performance.now();

        if (result && result.path.length > 0) {
          setPathResult({ ...result, executionTime: endTime - startTime, algorithm });
          toast({ title: "Ruta Calculada", description: `Ruta encontrada exitosamente con Dijkstra ${algorithm === 'simple' ? 'Simple' : 'con Heap'}.` });
        } else {
          setPathResult(null);
          toast({ title: "Ruta No Encontrada", description: "No se pudo encontrar una ruta entre los puntos seleccionados.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error calculating path:", error);
        setPathResult(null);
        toast({ title: "Error de Cálculo", description: "Ocurrió un error al calcular la ruta.", variant: "destructive" });
      } finally {
        setIsCalculatingPath(false);
      }
    }, 50);
  }, [graph, startNode, endNode, distanceWeight, safetyWeight, toast]);

  const clearSelection = () => {
    setStartPoint(null);
    setStartNode(null);
    setEndPoint(null);
    setEndNode(null);
    setPathResult(null);
    setIsSelectingStart(true);
    toast({ title: "Selección Limpiada", description: "Puedes seleccionar un nuevo origen." });
  };
  
  if (!graph) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando modelo de mapa...</p>
        </div>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto p-4 sm:p-6 min-h-screen bg-background">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary tracking-tight">
          Ruta Segura en Lima (Nivel San Miguel)
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Demostraciones de Dijkstra con Grafo Detallado
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <ControlsPanel
            startNode={startNode}
            endNode={endNode}
            safetyWeight={safetyWeight}
            onWeightChange={setSafetyWeight}
            onCalculatePathSimple={() => calculatePath('simple')}
            onCalculatePathHeap={() => calculatePath('heap')}
            isLoading={isCalculatingPath}
            onClear={clearSelection}
          />
          {isCalculatingPath && (
            <Card className="shadow-lg">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 min-h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Calculando ruta óptima...</p>
              </CardContent>
            </Card>
          )}
          {pathResult ? (
            <ResultsDisplay pathResult={pathResult} />
          ) : !isCalculatingPath && (
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Información de la Ruta</CardTitle>
                <CardDescription>Los detalles de la ruta aparecerán aquí.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Haz clic en el mapa para seleccionar un <span className="font-semibold text-primary">{isSelectingStart ? 'origen' : 'destino'}</span>.
                </p>
              </CardContent>
            </Card>
          )}
           <AlgorithmInfoPanel 
            lastResult={pathResult}
            numNodes={graphData.nodes.length}
            numEdges={graphData.edges.length}
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg h-[500px] lg:h-full">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl">Mapa Interactivo</CardTitle>
                <CardDescription>
                  Haz clic para seleccionar {isSelectingStart ? 'origen' : 'destino'}.
                  Estado: <span className="font-semibold text-primary">{isSelectingStart ? 'Seleccionando Origen' : 'Seleccionando Destino'}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] p-0">
               <MapComponent
                  nodes={graphData.nodes}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  startNode={startNode}
                  endNode={endNode}
                  pathNodes={pathResult?.path || []}
                  onMapClick={handleMapClick}
                />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
