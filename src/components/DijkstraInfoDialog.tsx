'use client';

// This component is no longer used and has been replaced by AlgorithmInfoPanel.tsx
// It is kept in the project to avoid breaking changes if it were referenced elsewhere,
// but it is not actively rendered in the application.

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, Zap, Package, Timer, Network, Shuffle, Sigma } from 'lucide-react';
import type { PathResult } from '@/types';

interface DijkstraInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lastResult: PathResult | null;
  numNodes: number;
  numEdges: number;
}

const DijkstraInfoDialog: React.FC<DijkstraInfoDialogProps> = ({
  isOpen,
  onClose,
  lastResult,
  numNodes,
  numEdges,
}) => {
  if (!isOpen) return null;

  const v = numNodes;
  const e = numEdges;
  const lastAlgorithmUsed = lastResult?.algorithm;
  const lastCalculationTime = lastResult?.executionTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Sobre los Algoritmos de Dijkstra
          </DialogTitle>
          <DialogDescription>
            Información sobre las implementaciones y su rendimiento en esta aplicación.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-5 -mr-2">
          <div className="grid gap-6 py-4 text-sm">
            
            <div>
              <h4 className="font-semibold text-primary mb-1">¿Cómo funciona Dijkstra?</h4>
              <p className="text-muted-foreground">
                El algoritmo de Dijkstra encuentra el camino de menor "costo" entre un nodo de origen y todos los demás nodos en un grafo ponderado. Funciona explorando iterativamente los nodos y seleccionando siempre el no visitado con el costo más bajo.
              </p>
              <p className="text-muted-foreground mt-1">
                En esta aplicación, el "costo" de cada calle puede ser su <code className="font-code p-1 bg-secondary/50 rounded-sm text-xs text-foreground">longitud</code> o su <code className="font-code p-1 bg-secondary/50 rounded-sm text-xs text-foreground">peligrosidad</code>, según la preferencia seleccionada.
              </p>
            </div>

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

            {lastResult && lastCalculationTime !== undefined && (
                 <div>
                    <h4 className="font-semibold text-primary mb-2 flex items-center"><Timer className="mr-2 h-4 w-4"/>Último Cálculo</h4>
                    <div className={`p-3 border rounded-md bg-secondary/30 ring-2 ${lastAlgorithmUsed === 'simple' ? 'ring-primary' : 'ring-accent'}`}>
                        <p className="text-xs font-medium text-muted-foreground flex items-center">
                            {lastAlgorithmUsed === 'simple' ? <Package className="mr-1.5 h-4 w-4"/> : <Zap className="mr-1.5 h-4 w-4"/>}
                            Dijkstra {lastAlgorithmUsed === 'simple' ? 'Simple (O(V²))' : 'con Heap (O(E log V))'}
                        </p>
                        <p className="font-bold font-code text-lg">
                            {lastCalculationTime.toFixed(2)} ms
                        </p>
                        <div className="border-t mt-2 pt-2 text-xs grid grid-cols-3 gap-2">
                           <p><strong className="font-medium">Nodos:</strong> {lastResult.visitedNodes}</p>
                           <p><strong className="font-medium">Dist:</strong> {lastResult.totalLength.toFixed(1)}</p>
                           <p><strong className="font-medium">Peligro:</strong> {lastResult.totalPeligrosidad.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div>
              <h4 className="font-semibold text-primary mb-1 flex items-center"><Shuffle className="mr-2 h-4 w-4" />Consideraciones de Rendimiento</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Implementación Simple (O(V²)):</strong> Su tiempo de ejecución crece cuadráticamente con el número de intersecciones (V). Es simple pero ineficiente para grafos grandes. En cada paso, debe buscar en *toda* la lista de nodos no visitados.
                </p>
                <p>
                  <strong className="text-foreground">Implementación con Heap (O(E log V)):</strong> Usa una estructura de datos especializada (un Min-Heap) para encontrar el siguiente nodo a visitar de manera muy eficiente. Es ideal para grafos grandes y es el estándar en aplicaciones reales.
                </p>
                 <p className="italic">
                  Con el grafo actual (V={v}), la diferencia de rendimiento entre ambos algoritmos es medible y significativa. ¡Prueba ambos!
                </p>
              </div>
            </div>

          </div>
        </ScrollArea>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DijkstraInfoDialog;
