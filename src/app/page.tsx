
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from '@/components/MapComponent';
import ControlsPanel from '@/components/ControlsPanel';
import ResultsDisplay from '@/components/ResultsDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import { limaData } from '@/data/lima-data';
import { dijkstra } from '@/lib/graph';
import type { District, Connection, PathResult } from '@/types';
import { adjustRiskWeights, type AdjustRiskWeightsInput, type AdjustRiskWeightsOutput } from '@/ai/flows/dynamic-risk-assessment';

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
  const [isAdjustingWeights, setIsAdjustingWeights] = useState(false);
  
  const [aiAdjustmentReason, setAiAdjustmentReason] = useState<string | null>(null);
  
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);


  useEffect(() => {
    setDistrictsList(limaData.districts);
    setConnectionsList(limaData.connections);
  }, []);

  const handleWeightChange = (newAlpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, parseFloat(newAlpha.toFixed(2))));
    setAlpha(clampedAlpha);
    setBeta(parseFloat((1 - clampedAlpha).toFixed(2)));
    setAiAdjustmentReason(null); 
  };

  const handleCalculatePath = useCallback(async () => {
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
        toast({ title: "Ruta Calculada", description: "El origen y el destino son el mismo." });
      }
      return;
    }

    setIsCalculatingPath(true);
    setPathResult(null); 
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); 
      const result = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, alpha, beta);
      if (result) {
        setPathResult(result);
        toast({ title: "Ruta Calculada", description: "Ruta encontrada exitosamente." });
      } else {
        toast({ title: "Ruta No Encontrada", description: "No se pudo encontrar una ruta entre los distritos seleccionados.", variant: "destructive" });
        setPathResult(null); 
      }
    } catch (error) {
      console.error("Error calculating path:", error);
      toast({ title: "Error de Cálculo", description: "Ocurrió un error al calcular la ruta.", variant: "destructive" });
      setPathResult(null);
    } finally {
      setIsCalculatingPath(false);
    }
  }, [selectedOriginId, selectedDestinationId, alpha, beta, districtsList, connectionsList, toast]);

  const handleAdjustWeightsAI = async () => {
    setIsAdjustingWeights(true);
    setAiAdjustmentReason(null);
    try {
      const allDistrictNames = districtsList.map(d => d.name);
      
      const input: AdjustRiskWeightsInput = { 
        distanceWeight: alpha, 
        safetyWeight: beta,
        allDistrictNames: allDistrictNames,
      };

      const result: AdjustRiskWeightsOutput = await adjustRiskWeights(input);
      
      let adjAlpha = result.adjustedDistanceWeight;
      let adjBeta = result.adjustedSafetyWeight;
      const sum = adjAlpha + adjBeta;

      if (Math.abs(sum - 1.0) > 0.001 && sum !== 0) {
        adjAlpha = parseFloat((adjAlpha / sum).toFixed(2));
        adjBeta = parseFloat((1.0 - adjAlpha).toFixed(2)); 
        toast({ title: "Pesos de IA Normalizados", description: "La salida de la IA fue normalizada por el sistema para sumar 1.", variant: "default" });
      } else if (sum === 0 || isNaN(adjAlpha) || isNaN(adjBeta)) {
        adjAlpha = 0.5; 
        adjBeta = 0.5;
        toast({ title: "Pesos de IA Corregidos", description: "La salida de la IA no era válida, se usó 0.5/0.5 por defecto.", variant: "destructive" });
      } else {
        adjBeta = parseFloat((1.0 - parseFloat(adjAlpha.toFixed(2))).toFixed(2));
        adjAlpha = parseFloat(adjAlpha.toFixed(2));
      }
      
      adjAlpha = Math.max(0, Math.min(1, adjAlpha));
      adjBeta = 1.0 - adjAlpha; 

      setAlpha(adjAlpha);
      setBeta(adjBeta); 

      setAiAdjustmentReason(result.reason);
      toast({ title: "Pesos Ajustados por IA", description: `Nuevos pesos: Alfa=${adjAlpha.toFixed(2)}, Beta=${adjBeta.toFixed(2)}` });

      if (selectedOriginId && selectedDestinationId) {
        setIsCalculatingPath(true);
        setPathResult(null);
        await new Promise(resolve => setTimeout(resolve, 50)); 
        const pathRecalcResult = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, adjAlpha, adjBeta);
        if (pathRecalcResult) {
          setPathResult(pathRecalcResult);
          toast({ title: "Ruta Recalculada", description: "Ruta recalculada con los nuevos pesos de la IA." });
        } else {
          toast({ title: "Ruta No Encontrada", description: "No se pudo encontrar una ruta con los nuevos pesos de la IA.", variant: "destructive" });
           setPathResult(null);
        }
        setIsCalculatingPath(false);
      }

    } catch (error) {
      console.error("Error adjusting weights with AI:", error);
      toast({ title: "Error de Ajuste IA", description: "Ocurrió un error al ajustar los pesos con la IA.", variant: "destructive" });
    } finally {
      setIsAdjustingWeights(false);
    }
  };

  const handleMapDistrictClick = (districtId: string) => {
    const districtName = districtsList.find(d => d.id === districtId)?.name || 'Distrito Desconocido';
    if (isSelectingOrigin) {
      setSelectedOriginId(districtId);
      toast({ title: "Origen Seleccionado", description: `${districtName} establecido como origen.`});
      if (districtId === selectedDestinationId) { 
        setSelectedDestinationId(null); 
        setIsSelectingOrigin(false); 
        return;
      }
    } else { 
      if (districtId === selectedOriginId) {
        toast({ title: "Selección Inválida", description: "El destino no puede ser el mismo que el origen.", variant: "destructive"});
        return; 
      }
      setSelectedDestinationId(districtId);
      toast({ title: "Destino Seleccionado", description: `${districtName} establecido como destino.`});
    }
    setIsSelectingOrigin(!isSelectingOrigin); 
  };
  
  const handleOriginSelectChange = (value: string) => {
    setSelectedOriginId(value);
    if (value === selectedDestinationId) setSelectedDestinationId(null);
  };

  const handleDestinationSelectChange = (value: string) => {
    setSelectedDestinationId(value);
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
          Navega por Lima con confianza. Encuentra los caminos más seguros y cortos.
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
            onCalculatePath={handleCalculatePath}
            onAdjustWeightsAI={handleAdjustWeightsAI}
            isLoading={isCalculatingPath}
            isAiLoading={isAdjustingWeights}
          />
           {pathResult && (
            <ResultsDisplay 
              pathResult={pathResult} 
              aiAdjustmentReason={aiAdjustmentReason} 
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
    </main>
  );
}
