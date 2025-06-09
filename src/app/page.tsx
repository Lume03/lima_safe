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
  // Default to a balance favoring distance.
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
    // Set a default origin and destination for initial view if desired
    // setSelectedOriginId(limaData.districts[0]?.id || null);
    // setSelectedDestinationId(limaData.districts[1]?.id || null);
  }, []);

  const handleWeightChange = (newAlpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, parseFloat(newAlpha.toFixed(2))));
    setAlpha(clampedAlpha);
    setBeta(parseFloat((1 - clampedAlpha).toFixed(2)));
    setAiAdjustmentReason(null); // Clear AI reason when manually adjusting
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
      // Simulate a short delay for UX, remove if not needed
      await new Promise(resolve => setTimeout(resolve, 300)); 
      const result = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, alpha, beta);
      if (result) {
        setPathResult(result);
        toast({ title: "Route Calculated", description: "Path found successfully." });
      } else {
        toast({ title: "No Path Found", description: "Could not find a path between the selected districts.", variant: "destructive" });
        setPathResult(null); 
      }
    } catch (error) {
      console.error("Error calculating path:", error);
      toast({ title: "Calculation Error", description: "An error occurred while calculating the path.", variant: "destructive" });
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
      const originName = districtsList.find(d => d.id === selectedOriginId)?.name;
      const destinationName = districtsList.find(d => d.id === selectedDestinationId)?.name;
      
      const input: AdjustRiskWeightsInput = { 
        distanceWeight: alpha, 
        safetyWeight: beta,
        allDistrictNames: allDistrictNames,
        originDistrictName: originName,
        destinationDistrictName: destinationName,
      };

      const result: AdjustRiskWeightsOutput = await adjustRiskWeights(input);
      
      let adjAlpha = result.adjustedDistanceWeight;
      let adjBeta = result.adjustedSafetyWeight;
      const sum = adjAlpha + adjBeta;

      // Normalize AI output if it doesn't sum to 1, or if it's invalid
      if (Math.abs(sum - 1.0) > 0.001 && sum !== 0) {
        adjAlpha = parseFloat((adjAlpha / sum).toFixed(2));
        adjBeta = parseFloat((1.0 - adjAlpha).toFixed(2)); // Recalculate beta based on normalized alpha
        toast({ title: "AI Weights Normalized", description: "AI output was normalized by the system to sum to 1.", variant: "default" });
      } else if (sum === 0 || isNaN(adjAlpha) || isNaN(adjBeta)) {
        adjAlpha = 0.5; // Default to 0.5/0.5 if AI output is invalid
        adjBeta = 0.5;
        toast({ title: "AI Weights Corrected", description: "AI output was invalid, defaulted to 0.5/0.5.", variant: "destructive" });
      } else {
         // Ensure beta is precisely 1 - alpha after rounding
        adjBeta = parseFloat((1.0 - parseFloat(adjAlpha.toFixed(2))).toFixed(2));
        adjAlpha = parseFloat(adjAlpha.toFixed(2)); // ensure alpha is also to 2 decimal places
      }
      
      // Clamp values to be between 0 and 1
      adjAlpha = Math.max(0, Math.min(1, adjAlpha));
      adjBeta = 1.0 - adjAlpha; // Final guarantee sum is 1

      setAlpha(adjAlpha);
      setBeta(adjBeta); 

      setAiAdjustmentReason(result.reason);
      toast({ title: "Weights Adjusted by AI", description: `New weights: Alpha=${adjAlpha.toFixed(2)}, Beta=${adjBeta.toFixed(2)}` });

      // If origin and destination are selected, recalculate path with new weights
      if (selectedOriginId && selectedDestinationId) {
        setIsCalculatingPath(true);
        setPathResult(null);
        // Short delay for state update to propagate before recalculating
        await new Promise(resolve => setTimeout(resolve, 50)); 
        const pathRecalcResult = dijkstra(districtsList, connectionsList, selectedOriginId, selectedDestinationId, adjAlpha, adjBeta);
        if (pathRecalcResult) {
          setPathResult(pathRecalcResult);
          toast({ title: "Route Recalculated", description: "Path recalculated with new AI weights." });
        } else {
          toast({ title: "No Path Found", description: "Could not find a path with new AI weights.", variant: "destructive" });
           setPathResult(null);
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
    const districtName = districtsList.find(d => d.id === districtId)?.name || 'Unknown District';
    if (isSelectingOrigin) {
      setSelectedOriginId(districtId);
      toast({ title: "Origin Selected", description: `${districtName} set as origin.`});
      if (districtId === selectedDestinationId) { // If new origin is same as old destination
        setSelectedDestinationId(null); // Clear destination
        setIsSelectingOrigin(false); // Switch to selecting destination next
        return;
      }
    } else { // Selecting destination
      if (districtId === selectedOriginId) {
        toast({ title: "Invalid Selection", description: "Destination cannot be the same as origin.", variant: "destructive"});
        return; // Keep selection mode on destination
      }
      setSelectedDestinationId(districtId);
      toast({ title: "Destination Selected", description: `${districtName} set as destination.`});
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
                <CardTitle className="font-headline">Route Information</CardTitle>
                <CardDescription>Details of the calculated route will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please select an origin and destination, adjust weights if desired, then click "Calculate Path".</p>
              </CardContent>
            </Card>
          )}
          {isCalculatingPath && (
            <Card className="shadow-lg">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 min-h-[150px]">
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
