'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { GraphNode } from '@/types';
import { Route, Info, Zap, Package, MapPin, X, Shield, Goal } from 'lucide-react'; 

interface ControlsPanelProps {
  startNode: GraphNode | null;
  endNode: GraphNode | null;
  safetyWeight: number;
  onWeightChange: (value: number) => void;
  onCalculatePathSimple: () => void;
  onCalculatePathHeap: () => void;
  isLoading: boolean;
  onClear: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  startNode,
  endNode,
  safetyWeight,
  onWeightChange,
  onCalculatePathSimple,
  onCalculatePathHeap,
  isLoading,
  onClear,
}) => {

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center justify-between">
          <div className="flex items-center">
            <Route className="mr-2 h-6 w-6" /> Planificador de Ruta
          </div>
          <Button onClick={onClear} variant="ghost" size="icon" className="h-7 w-7">
            <X className="h-5 w-5"/>
            <span className="sr-only">Limpiar selección</span>
          </Button>
        </CardTitle>
        <CardDescription>Selecciona puntos en el mapa y elige tus preferencias.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="flex items-center text-muted-foreground"><MapPin className="mr-1.5 h-4 w-4 text-green-500" /> Origen</Label>
            <div className="h-10 p-2 border rounded-md bg-secondary/30 text-sm truncate" title={startNode ? `ID: ${startNode.id}`: 'No seleccionado'}>
              {startNode ? `ID: ${startNode.id}` : 'No seleccionado'}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="flex items-center text-muted-foreground"><Goal className="mr-1.5 h-4 w-4 text-red-500"/> Destino</Label>
             <div className="h-10 p-2 border rounded-md bg-secondary/30 text-sm truncate" title={endNode ? `ID: ${endNode.id}`: 'No seleccionado'}>
              {endNode ? `ID: ${endNode.id}` : 'No seleccionado'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="weight-slider" className="text-base">Priorizar Ruta Por</Label>
             <div className="grid gap-2 pt-1">
              <Slider
                id="weight-slider"
                min={0}
                max={1}
                step={0.01}
                value={[safetyWeight]}
                onValueChange={(value) => onWeightChange(value[0])}
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center"><Route className="mr-1 h-3 w-3" /> Distancia</span>
                <span className="flex items-center">Seguridad <Shield className="ml-1 h-3 w-3" /></span>
              </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <Button 
            onClick={onCalculatePathSimple} 
            disabled={isLoading || !startNode || !endNode} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
            <Package className="mr-2 h-4 w-4" /> {isLoading ? 'Calculando...' : 'Dijkstra Simple'}
            </Button>
            <Button 
            onClick={onCalculatePathHeap} 
            disabled={isLoading || !startNode || !endNode} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
            <Zap className="mr-2 h-4 w-4" /> {isLoading ? 'Calculando...' : 'Dijkstra (Heap)'}
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ControlsPanel;
