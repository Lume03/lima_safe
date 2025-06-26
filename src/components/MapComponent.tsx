'use client';

import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary, Pin } from '@vis.gl/react-google-maps';
import type { GraphNode, LatLng } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph-logic';

const PathRenderer: React.FC<{ pathNodes: GraphNode[] }> = ({ pathNodes }) => {
  const map = useMap();
  const drawnPolylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const cleanup = () => {
      drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
      drawnPolylinesRef.current = [];
    };

    if (!map || pathNodes.length < 2) {
      cleanup();
      return;
    }

    cleanup(); // Clear previous path

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const fromNode = pathNodes[i];
      const toNode = pathNodes[i + 1];
      
      const edge = fromNode.edges.find(e => e.target === toNode.id);
      if (!edge) continue;

      const pathCoordinates = [
        { lat: fromNode.lat, lng: fromNode.lon },
        { lat: toNode.lat, lng: toNode.lon }
      ];

      const polyline = new google.maps.Polyline({
        path: pathCoordinates,
        strokeColor: getDangerColor(edge.peligrosidad),
        strokeOpacity: 0.9,
        strokeWeight: getDangerStrokeWeight(edge.peligrosidad),
        map: map,
      });

      drawnPolylinesRef.current.push(polyline);
    }
    
    return cleanup;

  }, [map, pathNodes]);

  return null;
};


interface MapComponentProps {
  nodes: GraphNode[];
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  startNode: GraphNode | null;
  endNode: GraphNode | null;
  pathNodes: GraphNode[];
  onMapClick: (coords: LatLng) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  nodes,
  startPoint,
  endPoint,
  startNode,
  endNode,
  pathNodes,
  onMapClick,
  center = { lat: -12.123, lng: -77.03 }, // Centered on Miraflores
  zoom = 15,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [clickedNode, setClickedNode] = useState<GraphNode | null>(null);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
          La API Key de Google Maps no está configurada.
        </p>
      </div>
    );
  }

  // Memoize markers to avoid re-rendering all of them on every state change
  const markers = React.useMemo(() => {
    // Only show nodes in the path or the selected start/end nodes
    const nodesInPathIds = new Set(pathNodes.map(n => n.id));
    const relevantNodes = nodes.filter(node => 
        nodesInPathIds.has(node.id) || 
        node.id === startNode?.id || 
        node.id === endNode?.id
    );

    // If no path or selection, show a subset of nodes to avoid clutter
    const nodesToRender = relevantNodes.length > 0 ? relevantNodes : nodes.slice(0, 200);

    return nodesToRender.map(node => (
      <AdvancedMarker
        key={node.id}
        position={{ lat: node.lat, lng: node.lon }}
        onClick={() => onMapClick({ lat: node.lat, lng: node.lon })}
        title={`Node ${node.id}`}
      >
        <Pin 
            background={'#F5F5F5'}
            borderColor={'#606060'}
            glyphColor={'#303030'}
            scale={0.5} 
        />
      </AdvancedMarker>
    ));
  }, [nodes, pathNodes, startNode, endNode, onMapClick]);


  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="limaSafeRouteMapDetailed"
        onClick={(e) => e.detail.latLng && onMapClick(e.detail.latLng)}
      >
        {markers}
        
        <PathRenderer pathNodes={pathNodes} />
        
        {startPoint && 
          <AdvancedMarker position={startPoint}>
             <Pin background={'#22C55E'} borderColor={'#16A34A'} glyphColor={'#FFFFFF'}/>
          </AdvancedMarker>
        }
        {endPoint && 
          <AdvancedMarker position={endPoint}>
             <Pin background={'#EF4444'} borderColor={'#DC2626'} glyphColor={'#FFFFFF'}/>
          </AdvancedMarker>
        }
        
        {startNode && (
          <InfoWindow position={{ lat: startNode.lat, lng: startNode.lon }}>
            <div className="p-1 font-medium">Origen (Nodo {startNode.id})</div>
          </InfoWindow>
        )}
        {endNode && (
          <InfoWindow position={{ lat: endNode.lat, lng: endNode.lon }}>
             <div className="p-1 font-medium">Destino (Nodo {endNode.id})</div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
