'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider'; // Import Slider
import type { District } from '@/types';
import { Route, Brain, TrendingUp, ShieldAlert } from 'lucide-react';

interface ControlsPanelProps {
  districts: District[];
  origin: string | null;
  destination: string | null;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  alpha: number;
  beta: number;
  onWeightChange: (newAlpha: number) => void;
  onCalculatePath: () => void;
  onAdjustWeightsAI: () => void;
  isLoading: boolean;
  isAiLoading: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  districts,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  alpha,
  beta,
  onWeightChange,
  onCalculatePath,
  onAdjustWeightsAI,
  isLoading,
  isAiLoading,
}) => {
  const handleSliderChange = (value: number[]) => {
    onWeightChange(value[0]);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <Route className="mr-2 h-6 w-6" /> Route Planner
        </CardTitle>
        <CardDescription>Select origin, destination, and adjust path preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="origin-select">Origin District</Label>
          <Select value={origin || ''} onValueChange={onOriginChange}>
            <SelectTrigger id="origin-select" className="w-full">
              <SelectValue placeholder="Select origin" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination-select">Destination District</Label>
          <Select value={destination || ''} onValueChange={onDestinationChange}>
            <SelectTrigger id="destination-select" className="w-full">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id} disabled={d.id === origin}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="weight-slider" className="text-base">Path Preference</Label>
          </div>
          <Slider
            id="weight-slider"
            value={[alpha]}
            max={1}
            step={0.01}
            onValueChange={handleSliderChange}
            className="w-full"
            aria-label="Path preference slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
            <span className="flex items-center"><TrendingUp className="mr-1 h-3 w-3 text-green-500"/> More Distance-Focused</span>
            <span className="flex items-center">More Safety-Focused <ShieldAlert className="ml-1 h-3 w-3 text-red-500"/></span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 bg-secondary/30 rounded-md text-center">
              <p className="text-xs text-muted-foreground">Distance (Alpha)</p>
              <p className="font-bold font-code text-sm">{alpha.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-secondary/30 rounded-md text-center">
              <p className="text-xs text-muted-foreground">Safety (Beta)</p>
              <p className="font-bold font-code text-sm">{beta.toFixed(2)}</p>
            </div>
          </div>
           <p className="text-xs text-muted-foreground text-center pt-1">Adjust the slider to prioritize shorter distance vs. greater safety. Alpha + Beta = 1.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={onCalculatePath} 
          disabled={isLoading || !origin || !destination} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? 'Calculating...' : 'Calculate Path'}
        </Button>
        <Button 
          onClick={onAdjustWeightsAI} 
          disabled={isAiLoading} 
          variant="outline" 
          className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isAiLoading ? 'AI Adjusting...' : 'AI Adjust Weights'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ControlsPanel;
