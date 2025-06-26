
'use client';

import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary, Pin } from '@vis.gl/react-google-maps';
import type { GraphNode, LatLng } from '@/types';
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph-logic';

const PathRenderer: React.FC<{ pathNodes: GraphNode[] }> = ({ pathNodes }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const drawnPolylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const cleanup = () => {
      drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
      drawnPolylinesRef.current = [];
    };

    if (!map || !routesLibrary || pathNodes.length < 2) {
      cleanup();
      return;
    }

    const directionsService = new routesLibrary.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin: { lat: pathNodes[0].lat, lng: pathNodes[0].lon },
      destination: { lat: pathNodes[pathNodes.length - 1].lat, lng: pathNodes[pathNodes.length - 1].lon },
      waypoints: pathNodes.slice(1, -1).map(node => ({
        location: { lat: node.lat, lng: node.lon },
        stopover: false
      })),
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      cleanup(); // Clean up before drawing new lines

      if (status === google.maps.DirectionsStatus.OK && result) {
        // We should have one leg for each segment of our path
        result.routes[0].legs.forEach((leg, index) => {
          const fromNode = pathNodes[index];
          const toNode = pathNodes[index + 1];
          const edge = fromNode.edges.find(e => e.target === toNode.id);
          
          if (!edge) return;

          const color = getDangerColor(edge.peligrosidad);
          const weight = getDangerStrokeWeight(edge.peligrosidad);

          // The path for this leg is the concatenation of the paths of its steps
          const pathForLeg = leg.steps.flatMap(step => step.path);
          
          const polyline = new google.maps.Polyline({
            path: pathForLeg,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: weight,
            map: map,
            zIndex: 1,
          });

          drawnPolylinesRef.current.push(polyline);
        });
      } else {
        console.error(`Error fetching directions ${result}`);
      }
    });

    return cleanup;
  }, [map, routesLibrary, pathNodes]);

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
    <APIProvider apiKey={apiKey} libraries={['routes']}>
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
