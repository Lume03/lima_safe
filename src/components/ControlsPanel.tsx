'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GraphNode } from '@/types';
import { Route, Info, Zap, Package, MapPin, X, Shield, Goal } from 'lucide-react'; 

interface ControlsPanelProps {
  startNode: GraphNode | null;
  endNode: GraphNode | null;
  weightType: 'length' | 'peligrosidad';
  onWeightTypeChange: (value: 'length' | 'peligrosidad') => void;
  onCalculatePathSimple: () => void;
  onCalculatePathHeap: () => void;
  isLoading: boolean;
  onShowDijkstraInfo: () => void;
  onClear: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  startNode,
  endNode,
  weightType,
  onWeightTypeChange,
  onCalculatePathSimple,
  onCalculatePathHeap,
  isLoading,
  onShowDijkstraInfo,
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
            <Label htmlFor="weight-type" className="text-base">Priorizar Ruta Por</Label>
            <RadioGroup
                id="weight-type"
                value={weightType}
                onValueChange={(value) => onWeightTypeChange(value as 'length' | 'peligrosidad')}
                className="grid grid-cols-2 gap-4"
            >
                <div>
                    <RadioGroupItem value="length" id="length" className="peer sr-only" />
                    <Label
                        htmlFor="length"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Route className="mb-3 h-6 w-6" />
                        Distancia
                    </Label>
                </div>

                <div>
                    <RadioGroupItem value="peligrosidad" id="peligrosidad" className="peer sr-only" />
                    <Label
                        htmlFor="peligrosidad"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Shield className="mb-3 h-6 w-6" />
                        Seguridad
                    </Label>
                </div>
            </RadioGroup>
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
        <Button 
          onClick={onShowDijkstraInfo}
          variant="outline" 
          className="w-full"
          aria-label="Mostrar información del algoritmo de Dijkstra"
        >
          <Info className="mr-2 h-4 w-4" />
          Info Algoritmos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ControlsPanel;
