
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
import { Info, Zap, Package, Timer } from 'lucide-react';

interface DijkstraInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  simpleTime: number | null;
  heapTime: number | null;
  lastAlgorithmUsed: 'simple' | 'heap' | null;
  numDistricts: number;
  numConnections: number;
}

const DijkstraInfoDialog: React.FC<DijkstraInfoDialogProps> = ({
  isOpen,
  onClose,
  simpleTime,
  heapTime,
  lastAlgorithmUsed,
  numDistricts,
  numConnections
}) => {
  if (!isOpen) {
    return null;
  }

  const lastCalculationTime = lastAlgorithmUsed === 'simple' ? simpleTime : (lastAlgorithmUsed === 'heap' ? heapTime : null);
  const v = numDistricts;
  const e = numConnections; // Assuming bidirectional connections are counted twice or as individual directed edges in data for E.
                           // For dense graphs E can be up to V*(V-1). For sparse, E can be close to V.

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Sobre los Algoritmos de Dijkstra
          </DialogTitle>
          <DialogDescription>
            Información sobre las implementaciones del algoritmo y su rendimiento en esta aplicación.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-5 -mr-2">
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
                <h4 className="font-semibold text-primary mb-2">Rendimiento Registrado (V={v}, E={e})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-md bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground flex items-center"><Package className="mr-1.5 h-4 w-4"/>Dijkstra Simple (O(V²))</p>
                        <p className="font-bold font-code text-lg">
                        {simpleTime !== null ? `${simpleTime.toFixed(2)} ms` : 'N/A'}
                        </p>
                    </div>
                    <div className="p-3 border rounded-md bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground flex items-center"><Zap className="mr-1.5 h-4 w-4"/>Dijkstra con Heap (O(E log V))</p>
                        <p className="font-bold font-code text-lg">
                        {heapTime !== null ? `${heapTime.toFixed(2)} ms` : 'N/A'}
                        </p>
                    </div>
                </div>
                 {lastAlgorithmUsed && lastCalculationTime !== null && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        <Timer className="inline mr-1 h-3 w-3"/>Último cálculo ({lastAlgorithmUsed === 'simple' ? 'Simple' : 'Heap'}): {lastCalculationTime.toFixed(2)} ms
                    </p>
                )}
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-1">Comparación de Complejidad</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Implementación Simple (O(V²)):</strong> En cada paso, busca linealmente el nodo no visitado con el menor costo. Si hay 'V' nodos (distritos), esto puede tomar hasta V operaciones, y se repite V veces. Su complejidad es aproximadamente V * V = V².
                </p>
                <p>
                  <strong className="text-foreground">Implementación con Heap Binario (O((V+E) log V) o O(E log V)):</strong> Utiliza una cola de prioridad (Min-Heap) para encontrar el nodo de menor costo de manera más eficiente (en tiempo logarítmico, log V). Cada una de las 'E' aristas (conexiones) y 'V' nodos se procesa, y las operaciones en el heap (inserción, extracción, actualización) toman O(log V).
                  Para grafos dispersos (donde E es cercano a V), es O(V log V). Para grafos densos (donde E es cercano a V²), puede ser O(V² log V) si no se maneja bien, pero usualmente se cita como O(E log V).
                </p>
                <p>
                  Para un número mayor de distritos y conexiones, la versión con Heap Binario es significativamente más rápida.
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
