
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
import { Info } from 'lucide-react';

interface DijkstraInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  calculationTime: number | null;
}

const DijkstraInfoDialog: React.FC<DijkstraInfoDialogProps> = ({
  isOpen,
  onClose,
  calculationTime,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Sobre el Algoritmo de Dijkstra
          </DialogTitle>
          <DialogDescription>
            Información sobre cómo funciona el algoritmo y su rendimiento en esta aplicación.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-5 -mr-2">
          <div className="grid gap-4 py-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">¿Cómo funciona?</h4>
              <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                <li>El algoritmo de Dijkstra encuentra el camino más corto (con el menor "costo") entre un nodo de origen y todos los demás nodos en un grafo ponderado.</li>
                <li>Comienza asignando un costo tentativo de infinito a todos los nodos y cero al nodo de origen.</li>
                <li>Mantiene un conjunto de nodos ya visitados (aquellos para los cuales ya se conoce el camino más corto desde el origen).</li>
                <li>En cada paso del algoritmo:
                  <ul className="list-disc space-y-1 pl-5 mt-1">
                    <li>Selecciona el nodo no visitado con el costo tentativo más bajo desde el origen.</li>
                    <li>Marca este nodo como visitado y lo añade al "camino más corto encontrado hasta ahora".</li>
                    <li>Para este nodo actual, considera todos sus nodos vecinos no visitados. Para cada vecino, calcula el costo de llegar a él a través del nodo actual.</li>
                    <li>Si este nuevo costo calculado es menor que el costo previamente asignado al vecino, actualiza el costo del vecino.</li>
                  </ul>
                </li>
                <li>El algoritmo continúa hasta que el nodo de destino es marcado como visitado, o hasta que el costo tentativo más pequeño entre los nodos no visitados restantes sea infinito (lo que significaría que no hay más caminos posibles al destino).</li>
                <li>En esta aplicación, el "costo" de cada segmento de ruta que el algoritmo evalúa se define como:
                  <br /> <code className="font-code p-1 bg-secondary/50 rounded-sm text-xs text-foreground mt-1 inline-block">costo = (alfa * distancia) + (beta * peligro)</code>.
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Rendimiento en esta Aplicación</h4>
              <p className="text-muted-foreground">
                Tiempo de cálculo para la última ruta encontrada:
                <span className="font-bold font-code text-foreground ml-1">
                  {calculationTime !== null ? `${calculationTime.toFixed(2)} ms` : 'N/A (calcula una ruta primero)'}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Complejidad Temporal</h4>
              <p className="text-muted-foreground">
                La complejidad temporal del algoritmo de Dijkstra depende de cómo se implemente, específicamente la estructura de datos usada para almacenar los nodos y encontrar el de menor costo.
              </p>
              <p className="text-muted-foreground">
                Con la implementación actual en esta aplicación (que implica una búsqueda lineal para encontrar el nodo de menor costo en cada paso):
                <br />Aproximadamente <span className="font-bold font-code text-foreground">O(V<sup>2</sup>)</span>, donde 'V' es el número de distritos (nodos).
              </p>
              <p className="text-muted-foreground">
                Si se utilizara una estructura de datos más optimizada como una cola de prioridad (por ejemplo, un heap binario), la complejidad podría mejorar a <span className="font-code font-bold text-foreground">O(E log V)</span> o <span className="font-code font-bold text-foreground">O((V+E) log V)</span>, donde 'E' es el número de conexiones (aristas).
              </p>
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
