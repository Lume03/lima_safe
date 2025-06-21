
'use client';

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
import { Info, Zap, Package, Timer, Network, Shuffle } from 'lucide-react';

interface DijkstraInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  simpleTime: number | null;
  heapTime: number | null;
  lastAlgorithmUsed: 'simple' | 'heap' | null;
  numDistricts: number;
  numConnections: number;
  isSameOriginDest: boolean;
}

const DijkstraInfoDialog: React.FC<DijkstraInfoDialogProps> = ({
  isOpen,
  onClose,
  simpleTime,
  heapTime,
  lastAlgorithmUsed,
  numDistricts,
  numConnections,
  isSameOriginDest
}) => {
  if (!isOpen) {
    return null;
  }

  const lastCalculationTime = lastAlgorithmUsed === 'simple' ? simpleTime : (lastAlgorithmUsed === 'heap' ? heapTime : null);
  const v = numDistricts;
  // For E, we are counting directed edges. If connections are bidirectional and listed once, E = connections.length.
  // If listed twice (A->B, B->A), E = connections.length.
  // Dijkstra's complexity often refers to E as number of edges algorithm traverses.
  const e = numConnections; // Use the prop passed from page.tsx


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
                El algoritmo de Dijkstra encuentra el camino de menor "costo" entre un nodo de origen y todos los demás nodos en un grafo ponderado. Funciona explorando iterativamente los nodos, actualizando los costos tentativos a sus vecinos y seleccionando siempre el nodo no visitado con el costo más bajo.
              </p>
              <p className="text-muted-foreground mt-1">
                En esta aplicación, el "costo" de cada segmento se calcula como: <code className="font-code p-1 bg-secondary/50 rounded-sm text-xs text-foreground mt-1 inline-block">costo = (alfa * distancia) + (beta * peligro)</code>.
              </p>
            </div>

             <div>
                <h4 className="font-semibold text-primary mb-2 flex items-center"><Network className="mr-2 h-4 w-4"/>Tamaño del Grafo Actual</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 border rounded-md bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground">Distritos (V)</p>
                        <p className="font-bold font-code text-lg">{v}</p>
                    </div>
                    <div className="p-2 border rounded-md bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground">Conexiones (E)</p>
                        <p className="font-bold font-code text-lg">{e}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-primary mb-2 flex items-center"><Timer className="mr-2 h-4 w-4"/>Rendimiento Registrado</h4>
                {isSameOriginDest && lastCalculationTime === 0 && (
                     <p className="text-xs text-center italic text-muted-foreground mb-2">
                        (El último cálculo fue para el mismo origen y destino, tiempo = 0 ms por definición)
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`p-3 border rounded-md bg-secondary/30 ${lastAlgorithmUsed === 'simple' ? 'ring-2 ring-primary' : ''}`}>
                        <p className="text-xs font-medium text-muted-foreground flex items-center"><Package className="mr-1.5 h-4 w-4"/>Dijkstra Simple (O(V²))</p>
                        <p className="font-bold font-code text-lg">
                        {simpleTime !== null ? `${simpleTime.toFixed(2)} ms` : 'N/A'}
                        </p>
                    </div>
                    <div className={`p-3 border rounded-md bg-secondary/30 ${lastAlgorithmUsed === 'heap' ? 'ring-2 ring-accent' : ''}`}>
                        <p className="text-xs font-medium text-muted-foreground flex items-center"><Zap className="mr-1.5 h-4 w-4"/>Dijkstra con Heap (O(E log V))</p>
                        <p className="font-bold font-code text-lg">
                        {heapTime !== null ? `${heapTime.toFixed(2)} ms` : 'N/A'}
                        </p>
                    </div>
                </div>
                 {lastAlgorithmUsed && lastCalculationTime !== null && !isSameOriginDest && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        <Timer className="inline mr-1 h-3 w-3"/>Último cálculo ({lastAlgorithmUsed === 'simple' ? 'Simple' : 'Heap'}): {lastCalculationTime.toFixed(2)} ms
                    </p>
                )}
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-1 flex items-center"><Shuffle className="mr-2 h-4 w-4" />Consideraciones de Rendimiento</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Implementación Simple (O(V²)):</strong> En cada uno de los V pasos, busca linealmente entre hasta V nodos no visitados para encontrar el de menor costo. Su complejidad es aproximadamente V * V = V².
                </p>
                <p>
                  <strong className="text-foreground">Implementación con Heap Binario (O(E log V)):</strong> Utiliza una cola de prioridad (Min-Heap) para encontrar el nodo de menor costo de forma más eficiente (O(log V)). Cada una de las E aristas puede causar una actualización en el heap (también O(log V)). En total, es O(E log V) si E es mayor que V, o O((V+E)logV) para ser precisos.
                </p>
                <p className="italic">
                  <strong className="text-foreground">Nota sobre grafos pequeños:</strong> Para un número reducido de distritos y conexiones como en este demo (V={v}, E={e}), la diferencia de rendimiento puede no ser drástica, o incluso la versión "simple" podría ser marginalmente más rápida en algunas ejecuciones. Esto se debe al costo fijo (overhead) de mantener la estructura del heap. La ventaja teórica de O(E log V) se vuelve claramente dominante en grafos mucho más grandes. Los tiempos de 0.00ms pueden ocurrir si la ejecución es extremadamente rápida, por debajo de la resolución de la medición del navegador.
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
