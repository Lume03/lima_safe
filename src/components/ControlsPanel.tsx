'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { District } from '@/types';
import { Route,SlidersHorizontal, Brain } from 'lucide-react';

interface ControlsPanelProps {
  districts: District[];
  origin: string | null;
  destination: string | null;
  alpha: number;
  beta: number;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAlphaChange: (value: number) => void;
  onBetaChange: (value: number) => void;
  onCalculatePath: () => void;
  onAdjustWeightsAI: () => void;
  isLoading: boolean;
  isAiLoading: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  districts,
  origin,
  destination,
  alpha,
  beta,
  onOriginChange,
  onDestinationChange,
  onAlphaChange,
  onBetaChange,
  onCalculatePath,
  onAdjustWeightsAI,
  isLoading,
  isAiLoading,
}) => {
  const handleAlphaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0; // Handle empty input or invalid number
    onAlphaChange(value);
  };

  const handleBetaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0; // Handle empty input or invalid number
    onBetaChange(value);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <Route className="mr-2 h-6 w-6" /> Route Planner
        </CardTitle>
        <CardDescription>Select origin, destination, and adjust weights for path calculation. Alpha + Beta must equal 1.</CardDescription>
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

        <div className="space-y-2">
          <Label htmlFor="alpha-input" className="flex items-center">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /> Distance Weight (Alpha)</Label>
          <Input
            id="alpha-input"
            type="number"
            value={alpha.toFixed(2)} // Display with 2 decimal places
            onChange={handleAlphaInputChange}
            step="0.01" // Allow finer control
            min="0"
            max="1"
            className="font-code"
          />
           <p className="text-xs text-muted-foreground">Importance of distance (0 to 1). Modifying this will adjust Beta.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beta-input" className="flex items-center">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /> Safety Weight (Beta)</Label>
          <Input
            id="beta-input"
            type="number"
            value={beta.toFixed(2)} // Display with 2 decimal places
            onChange={handleBetaInputChange}
            step="0.01" // Allow finer control
            min="0"
            max="1"
            className="font-code"
          />
          <p className="text-xs text-muted-foreground">Importance of safety (0 to 1). Modifying this will adjust Alpha.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onCalculatePath} disabled={isLoading || !origin || !destination} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? 'Calculating...' : 'Calculate Path'}
        </Button>
        <Button onClick={onAdjustWeightsAI} disabled={isAiLoading} variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent">
          <Brain className="mr-2 h-4 w-4" />
          {isAiLoading ? 'Adjusting...' : 'AI Adjust Weights'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ControlsPanel;
