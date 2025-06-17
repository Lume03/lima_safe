
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from '@/components/MapComponent';
import ControlsPanel from '@/components/ControlsPanel';
import ResultsDisplay from '@/components/ResultsDisplay';
import DijkstraInfoDialog from '@/components/DijkstraInfoDialog'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import { limaData } from '@/data/lima-data';
import { dijkstraSimple, dijkstraWithHeap } from '@/lib/graph';
import type { District, Connection, PathResult } from '@/types';


export default function HomePage() {
  const { toast } = useToast();
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [connectionsList, setConnectionsList] = useState<Connection[]>([]);

  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  
  const [alpha, setAlpha] = useState(0.6); 
  const [beta, setBeta] = useState(0.4);   

  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);

  const [dijkstraSimpleTime, setDijkstraSimpleTime] = useState<number | null>(null);
  const [dijkstraHeapTime, setDijkstraHeapTime] = useState<number | null>(null);
  const [lastAlgorithmUsed, setLastAlgorithmUsed] = useState<'simple' | 'heap' | null>(null);
  const [isDijkstraInfoDialogOpen, setIsDijkstraInfoDialogOpen] = useState(false);


  useEffect(() => {
    setDistrictsList(limaData.districts);
    setConnectionsList(limaData.connections);
  }, []);

  const handleWeightChange = (newAlpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, parseFloat(newAlpha.toFixed(2))));
    setAlpha(clampedAlpha);
    setBeta(parseFloat((1 - clampedAlpha).toFixed(2)));
  };

  const calculatePath = useCallback(async (algorithmType: 'simple' | 'heap') => {
    if (!selectedOriginId || !selectedDestinationId) {
      toast({ title: "Selección Incompleta", description: "Por favor, selecciona los distritos de origen y destino.", variant: "destructive" });
      return;
    }
    if (selectedOriginId === selectedDestinationId) {
       const originNode = districtsList.find(d => d.id === selectedOriginId);
       if (originNode) {
        setPathResult({
          pathNodes: [originNode],
          segments: [],
          totalDistance: 0,
          totalDangerScore: 0,
          totalWeightedCost: 0,
        });
        if (algorithmType === 'simple') setDijkstraSimpleTime(0);
        else setDijkstraHeapTime(0);
        setLastAlgorithmUsed(algorithmType);
        toast({ title: "Ruta Calculada", description: "El origen y el destino son el mismo." });
      }
      setIsCalculatingPath(false); // Ensure loading state is turned off
      return;
    }

    setIsCalculatingPath(true);
    setPathResult(null); 
    
    try {
      // Simulate a small delay to ensure UI updates before potentially blocking calculation
      await new Promise(resolve => setTimeout(resolve, 50)); 
      
      const startTime = performance.now();
      let result: PathResult | null = null;
      if (algorithmType === 'simple') {
        result = dijkstraSimple(districtsList, connectionsList, selectedOriginId, selectedDestinationId, alpha, beta);
      } else {
        result = dijkstraWithHeap(districtsList, connectionsList, selectedOriginId, selectedDestinationId, alpha, beta);
      }
      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      if (algorithmType === 'simple') setDijkstraSimpleTime(calculationTime);
      else setDijkstraHeapTime(calculationTime);
      setLastAlgorithmUsed(algorithmType);
      
      if (result && result.pathNodes.length > 0) {
        setPathResult(result);
        toast({ title: "Ruta Calculada", description: `Ruta encontrada exitosamente usando Dijkstra ${algorithmType === 'simple' ? 'Simple (O(V²))' : 'con Heap (O(E log V))'}.` });
      } else {
        toast({ title: "Ruta No Encontrada", description: "No se pudo encontrar una ruta entre los distritos seleccionados.", variant: "destructive" });
        setPathResult(null); 
      }
    } catch (error) {
      console.error("Error calculating path:", error);
      toast({ title: "Error de Cálculo", description: "Ocurrió un error al calcular la ruta.", variant: "destructive" });
      setPathResult(null);
      // Reset times on error too
      if (algorithmType === 'simple') setDijkstraSimpleTime(null); 
      else setDijkstraHeapTime(null);
    } finally {
      setIsCalculatingPath(false);
    }
  }, [selectedOriginId, selectedDestinationId, alpha, beta, districtsList, connectionsList, toast]);


  const handleMapDistrictClick = (districtId: string) => {
    const districtName = districtsList.find(d => d.id === districtId)?.name || 'Distrito Desconocido';
    if (isSelectingOrigin) {
      setSelectedOriginId(districtId);
      toast({ title: "Origen Seleccionado", description: `${districtName} establecido como origen.`});
      if (districtId === selectedDestinationId) { 
        setSelectedDestinationId(null); 
      }
      setIsSelectingOrigin(false); // Always switch to destination selection after origin
    } else { 
      if (districtId === selectedOriginId) { // If re-clicking origin, do nothing or allow re-selection? For now, treat as new destination
        // toast({ title: "Selección Inválida", description: "El destino no puede ser el mismo que el origen.", variant: "destructive"});
        // return; 
         setSelectedDestinationId(districtId); // This makes origin and dest same, path calc will handle.
         toast({ title: "Destino Seleccionado", description: `${districtName} establecido como destino.`});

      } else {
        setSelectedDestinationId(districtId);
        toast({ title: "Destino Seleccionado", description: `${districtName} establecido como destino.`});
      }
      setIsSelectingOrigin(true); // Switch back to origin selection
    }
  };
  
  const handleOriginSelectChange = (value: string) => {
    setSelectedOriginId(value);
    if (value === selectedDestinationId) setSelectedDestinationId(null);
  };

  const handleDestinationSelectChange = (value: string) => {
    setSelectedDestinationId(value);
  };

  const handleToggleDijkstraInfoDialog = () => {
    setIsDijkstraInfoDialogOpen(prev => !prev);
  };

  const selectedOriginDistrict = districtsList.find(d => d.id === selectedOriginId) || null;
  const selectedDestinationDistrict = districtsList.find(d => d.id === selectedDestinationId) || null;

  return (
    <main className="container mx-auto p-4 sm:p-6 min-h-screen bg-background">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary tracking-tight">
          Ruta Segura en Lima
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          ADA Grupo 5
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <ControlsPanel
            districts={districtsList}
            origin={selectedOriginId}
            destination={selectedDestinationId}
            onOriginChange={handleOriginSelectChange}
            onDestinationChange={handleDestinationSelectChange}
            alpha={alpha}
            beta={beta}
            onWeightChange={handleWeightChange}
            onCalculatePathSimple={() => calculatePath('simple')}
            onCalculatePathHeap={() => calculatePath('heap')}
            isLoading={isCalculatingPath}
            onShowDijkstraInfo={handleToggleDijkstraInfoDialog}
          />
           {pathResult && (
            <ResultsDisplay 
              pathResult={pathResult} 
            />
          )}
          {!pathResult && !isCalculatingPath && (
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Información de la Ruta</CardTitle>
                <CardDescription>Los detalles de la ruta calculada aparecerán aquí.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Por favor, selecciona un origen y destino, ajusta los pesos si lo deseas, y luego haz clic en "Calcular Ruta".</p>
              </CardContent>
            </Card>
          )}
          {isCalculatingPath && (
            <Card className="shadow-lg">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 min-h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Calculando ruta óptima...</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg h-[500px] lg:h-full">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl">Mapa Interactivo</CardTitle>
                <CardDescription>
                  Haz clic en el mapa para seleccionar {isSelectingOrigin ? 'origen' : 'destino'}.
                  Selección actual: <span className="font-semibold text-primary">{isSelectingOrigin ? 'Origen' : 'Destino'}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] p-0">
              <MapComponent
                districts={districtsList}
                selectedOrigin={selectedOriginDistrict}
                selectedDestination={selectedDestinationDistrict}
                pathSegments={pathResult?.segments || []}
                onDistrictClick={handleMapDistrictClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <DijkstraInfoDialog
        isOpen={isDijkstraInfoDialogOpen}
        onClose={handleToggleDijkstraInfoDialog}
        simpleTime={dijkstraSimpleTime}
        heapTime={dijkstraHeapTime}
        lastAlgorithmUsed={lastAlgorithmUsed}
        numDistricts={districtsList.length}
        numConnections={connectionsList.length}
        isSameOriginDest={selectedOriginId !== null && selectedOriginId === selectedDestinationId}
      />
    </main>
  );
}

    