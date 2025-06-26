'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Shuffle, Info } from 'lucide-react';
import type { PathResult } from '@/types';

interface AlgorithmInfoPanelProps {
  lastResult: PathResult | null;
  numNodes: number;
  numEdges: number;
}

const AlgorithmInfoPanel: React.FC<AlgorithmInfoPanelProps> = ({
  lastResult,
  numNodes,
  numEdges,
}) => {
  const v = numNodes;
  const e = numEdges;

  return (
    <Card className="shadow-lg animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Información del Algoritmo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div>
            <h4 className="font-semibold text-primary mb-2 flex items-center"><Network className="mr-2 h-4 w-4"/>Tamaño del Grafo Actual</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 border rounded-md bg-secondary/30">
                    <p className="text-xs font-medium text-muted-foreground">Intersecciones (V)</p>
                    <p className="font-bold font-code text-lg">{v.toLocaleString()}</p>
                </div>
                <div className="p-2 border rounded-md bg-secondary/30">
                    <p className="text-xs font-medium text-muted-foreground">Calles (E)</p>
                    <p className="font-bold font-code text-lg">{e.toLocaleString()}</p>
                </div>
            </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary mb-1 flex items-center"><Shuffle className="mr-2 h-4 w-4" />Consideraciones de Rendimiento</h4>
          <div className="space-y-2 text-muted-foreground p-3 border rounded-md bg-secondary/30">
            {!lastResult ? (
                <p>La complejidad del algoritmo se mostrará aquí después de realizar un cálculo.</p>
            ) : lastResult.algorithm === 'simple' ? (
                <p>
                  <strong className="text-foreground">Complejidad Simple: O(V²)</strong>. El tiempo de ejecución crece cuadráticamente con el número de intersecciones (V). Es simple pero puede ser ineficiente para grafos grandes.
                </p>
            ) : (
                <p>
                  <strong className="text-foreground">Complejidad con Heap: O(E log V)</strong>. Usa una cola de prioridad (Min-Heap) para ser mucho más eficiente, especialmente en grafos grandes. Es el estándar en aplicaciones reales.
                </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmInfoPanel;
