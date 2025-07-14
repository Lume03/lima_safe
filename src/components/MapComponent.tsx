'use client';

import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useMap } from '@vis.gl/react-google-maps';
import type { GraphNode, LatLng } from '@/types';
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph-logic';

// New component to handle drawing polylines imperatively
const PathPolylines: React.FC<{ pathNodes: GraphNode[] }> = ({ pathNodes }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || pathNodes.length < 2) {
      return;
    }

    const polylines: google.maps.Polyline[] = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const node = pathNodes[i];
      const nextNode = pathNodes[i + 1];
      const edge = node.edges.find(e => e.target === nextNode.id);

      if (!edge) continue;

      const color = getDangerColor(edge.peligrosidad);
      const weight = getDangerStrokeWeight(edge.peligrosidad);

      const polyline = new window.google.maps.Polyline({
        path: [
          { lat: node.lat, lng: node.lon },
          { lat: nextNode.lat, lng: nextNode.lon }
        ],
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: weight,
        zIndex: 1
      });

      polyline.setMap(map);
      polylines.push(polyline);
    }
    
    // Cleanup function to remove polylines when component unmounts or path changes
    return () => {
      polylines.forEach(p => p.setMap(null));
    };

  }, [map, pathNodes]);

  return null; // This component does not render anything itself
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
  center = { lat: -12.087, lng: -77.085 }, // Centered on San Miguel
  zoom = 15,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
    // Show all nodes to ensure they are always selectable.
    return nodes.map(node => (
      <AdvancedMarker
        key={node.id}
        position={{ lat: node.lat, lng: node.lon }}
        onClick={() => onMapClick({ lat: node.lat, lng: node.lon })}
        title={`Nodo ${node.id}`}
      >
        <Pin 
            background={'#F5F5F5'}
            borderColor={'#606060'}
            glyphColor={'#303030'}
            scale={0.5} 
        />
      </AdvancedMarker>
    ));
  }, [nodes, onMapClick]);


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
        
        <PathPolylines pathNodes={pathNodes} />
        
        {startPoint && 
          <AdvancedMarker position={startPoint} zIndex={10}>
             <Pin background={'#22C55E'} borderColor={'#16A34A'} glyphColor={'#FFFFFF'} scale={1.2}/>
          </AdvancedMarker>
        }
        {endPoint && 
          <AdvancedMarker position={endPoint} zIndex={10}>
             <Pin background={'#EF4444'} borderColor={'#DC2626'} glyphColor={'#FFFFFF'} scale={1.2}/>
          </AdvancedMarker>
        }
        
        {startNode && (
          <InfoWindow position={{ lat: startNode.lat, lng: startNode.lon }} zIndex={11}>
            <div className="p-1 font-medium">Origen (Nodo {startNode.id})</div>
          </InfoWindow>
        )}
        {endNode && (
          <InfoWindow position={{ lat: endNode.lat, lng: endNode.lon }} zIndex={11}>
             <div className="p-1 font-medium">Destino (Nodo {endNode.id})</div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
