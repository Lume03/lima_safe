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
  
  // Alpha (distance weight) and Beta (safety weight) must sum to 1.
  // Default to a balance favoring distance slightly.
  const [alpha, setAlpha] = useState(0.7); 
  const [beta, setBeta] = useState(0.3);   

  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  const [isAdjustingWeights, setIsAdjustingWeights] = useState(false);
  
  const [aiAdjustmentReason, setAiAdjustmentReason] = useState<string | null>(null);
  
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);


  useEffect(() => {
    setDistrictsList(limaData.districts);
    setConnectionsList(limaData.connections);
  }, []);

  const handleAlphaChange = (newAlpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, parseFloat(newAlpha.toFixed(2))));
    setAlpha(clampedAlpha);
    setBeta(parseFloat((1 - clampedAlpha).toFixed(2)));
  };

  const handleBetaChange = (newBeta: number) => {
    const clampedBeta = Math.max(0, Math.min(1, parseFloat(newBeta.toFixed(2))));
    setBeta(clampedBeta);
    setAlpha(parseFloat((1 - clampedBeta).toFixed(2)));
  };

  const handleCalculatePath = useCallback(async () => {
    if (!selectedOriginId || !selectedDestinationId) {
      toast({ title: "Selection Missing", description: "Please select both origin and destination districts.", variant: "destructive" });
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
        toast({ title: "Route Calculated", description: "Origin and destination are the same." });
      }
      return;
    }

    setIsCalculatingPath(true);
    setPathResult(null); 
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, alpha, beta);
      if (result) {
        setPathResult(result);
        toast({ title: "Route Calculated", description: "Path found successfully." });
      } else {
        toast({ title: "No Path Found", description: "Could not find a path between the selected districts.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error calculating path:", error);
      toast({ title: "Calculation Error", description: "An error occurred while calculating the path.", variant: "destructive" });
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
      
      // Ensure AI output sums to 1, normalize if necessary
      let adjAlpha = result.adjustedDistanceWeight;
      let adjBeta = result.adjustedSafetyWeight;
      const sum = adjAlpha + adjBeta;

      if (sum !== 0 && Math.abs(sum - 1.0) > 0.001) { // Check if sum is not 1 (with tolerance)
        adjAlpha = parseFloat((adjAlpha / sum).toFixed(2));
        adjBeta = parseFloat((adjBeta / sum).toFixed(2));
         // Ensure strict sum to 1 by assigning the remainder to beta after alpha is set
        adjBeta = parseFloat((1 - adjAlpha).toFixed(2));
        toast({ title: "AI Weights Normalized", description: "AI output was normalized to sum to 1.", variant: "default" });
      } else if (sum === 0) { // Avoid division by zero, default to 0.5/0.5
        adjAlpha = 0.5;
        adjBeta = 0.5;
        toast({ title: "AI Weights Corrected", description: "AI output was invalid, defaulted to 0.5/0.5.", variant: "destructive" });
      }


      setAlpha(Math.max(0, Math.min(1, adjAlpha)));
      // Beta is derived from alpha to ensure sum is 1
      setBeta(Math.max(0, Math.min(1, 1 - adjAlpha))); 

      setAiAdjustmentReason(result.reason);
      toast({ title: "Weights Adjusted by AI", description: `New weights: Alpha=${alpha.toFixed(2)}, Beta=${beta.toFixed(2)}` });

      if (selectedOriginId && selectedDestinationId) {
         // Recalculate path with new weights immediately
        const recalcAlpha = Math.max(0, Math.min(1, adjAlpha));
        const recalcBeta = Math.max(0, Math.min(1, 1 - recalcAlpha));
        
        setIsCalculatingPath(true);
        setPathResult(null);
        await new Promise(resolve => setTimeout(resolve, 100)); // short delay for state update
        const pathRecalcResult = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, recalcAlpha, recalcBeta);
        if (pathRecalcResult) {
          setPathResult(pathRecalcResult);
          toast({ title: "Route Recalculated", description: "Path recalculated with new AI weights." });
        } else {
          toast({ title: "No Path Found", description: "Could not find a path with new AI weights.", variant: "destructive" });
        }
        setIsCalculatingPath(false);
      }

    } catch (error) {
      console.error("Error adjusting weights with AI:", error);
      toast({ title: "AI Adjustment Error", description: "An error occurred while adjusting weights.", variant: "destructive" });
    } finally {
      setIsAdjustingWeights(false);
    }
  };

  const handleMapDistrictClick = (districtId: string) => {
    if (isSelectingOrigin) {
      setSelectedOriginId(districtId);
      toast({ title: "Origin Selected", description: `${districtsList.find(d=>d.id === districtId)?.name} set as origin.`});
      if (districtId === selectedDestinationId) setSelectedDestinationId(null); 
    } else {
      if (districtId === selectedOriginId) {
        toast({ title: "Invalid Selection", description: "Destination cannot be the same as origin.", variant: "destructive"});
        return;
      }
      setSelectedDestinationId(districtId);
      toast({ title: "Destination Selected", description: `${districtsList.find(d=>d.id === districtId)?.name} set as destination.`});
    }
    setIsSelectingOrigin(!isSelectingOrigin); 
  };
  
  const selectedOriginDistrict = districtsList.find(d => d.id === selectedOriginId) || null;
  const selectedDestinationDistrict = districtsList.find(d => d.id === selectedDestinationId) || null;

  return (
    <main className="container mx-auto p-4 sm:p-6 min-h-screen bg-background">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary tracking-tight">
          Lima Safe Route
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Navigate Lima with confidence. Find the safest and shortest paths.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <ControlsPanel
            districts={districtsList}
            origin={selectedOriginId}
            destination={selectedDestinationId}
            alpha={alpha}
            beta={beta}
            onAlphaChange={handleAlphaChange}
            onBetaChange={handleBetaChange}
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
                <CardTitle className="font-headline">Route Information</CardTitle>
                <CardDescription>Details of the calculated route will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please select an origin and destination, then click "Calculate Path".</p>
              </CardContent>
            </Card>
          )}
          {isCalculatingPath && (
            <Card className="shadow-lg">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Calculating optimal path...</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg h-[500px] lg:h-full">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl">Interactive Map</CardTitle>
                <CardDescription>
                  Click on the map to select {isSelectingOrigin ? 'origin' : 'destination'}.
                  Current selection: <span className="font-semibold text-primary">{isSelectingOrigin ? 'Origin' : 'Destination'}</span>.
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
