'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PathResult } from '@/types';
import { MapPinned, AlertTriangle, Sigma, Route, Timer, Package, Zap } from 'lucide-react';

interface ResultsDisplayProps {
  pathResult: PathResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ pathResult }) => {
  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <MapPinned className="mr-2 h-6 w-6" /> Resultados del Cálculo
        </CardTitle>
        <CardDescription>
          Algoritmo: Dijkstra {pathResult.algorithm === 'simple' ? 'Simple' : 'con Heap'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-primary/10 rounded-md border border-primary/20 text-center">
            <h4 className="font-semibold text-sm text-primary flex items-center justify-center">
                <Sigma className="mr-2 h-4 w-4" /> Costo Total Calculado
            </h4>
            <p className="font-code text-2xl font-bold text-primary">{pathResult.totalCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">(distancia × peso) + (peligro × peso)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              <Route className="mr-1 h-4 w-4"/> Distancia Total
            </h4>
            <p className="font-code text-xl font-bold">{(pathResult.totalLength / 1000).toFixed(2)} km</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4"/> Peligro Acumulado
            </h4>
            <p className="font-code text-xl font-bold">{pathResult.totalPeligrosidad.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              <Timer className="mr-1 h-4 w-4"/> Tiempo de Ejecución
            </h4>
            <p className="font-code text-lg font-bold">{pathResult.executionTime.toFixed(2)} ms</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              {pathResult.algorithm === 'simple' ? <Package className="mr-1 h-4 w-4"/> : <Zap className="mr-1 h-4 w-4"/>} Nodos Visitados
            </h4>
            <p className="font-code text-lg font-bold">{pathResult.visitedNodes}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Ruta ({pathResult.path.length} nodos)</h3>
          <p className="text-xs text-muted-foreground">
             La ruta es la secuencia de intersecciones. Se resalta en el mapa.
          </p>
          <div className="text-xs text-muted-foreground mt-2 bg-secondary/30 p-2 rounded-md font-code break-words">
            {pathResult.path.map(n => n.id).join(' → ')}
          </div>
        </div>
      
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
