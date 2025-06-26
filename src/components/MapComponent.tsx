
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph';

// This component renders the calculated path by drawing individual, colored polylines for each segment.
// It makes a single efficient Directions API call to get the geometry for the whole route.
const PathRenderer: React.FC<{ pathSegments: PathSegment[] }> = ({ pathSegments }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const directionsServiceRef = React.useRef<google.maps.DirectionsService | null>(null);
  // This ref will hold the polylines we draw on the map so we can clean them up
  const drawnPolylinesRef = React.useRef<google.maps.Polyline[]>([]);

  React.useEffect(() => {
    // Exit if the map, routes library, or path segments aren't ready
    if (!map || !routesLibrary || !pathSegments) {
      return;
    }

    // Initialize the directions service once
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new routesLibrary.DirectionsService();
    }

    // --- Cleanup function to remove old polylines from the map ---
    const cleanup = () => {
      drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
      drawnPolylinesRef.current = [];
    };

    // If there are no segments, just clean up any old route and exit
    if (pathSegments.length === 0) {
      cleanup();
      return;
    }

    const directionsService = directionsServiceRef.current;

    // --- Build the request for the Directions API ---
    // We use waypoints to get a route that passes through all intermediate districts.
    const origin = pathSegments[0].from;
    const destination = pathSegments[pathSegments.length - 1].to;
    
    // Waypoints are all the intermediate points in the path.
    // 'stopover: true' is crucial to ensure the API returns a separate "leg" for each segment.
    const waypoints: google.maps.DirectionsWaypoint[] = pathSegments.slice(0, -1).map(segment => ({
      location: { lat: segment.to.lat, lng: segment.to.lng },
      stopover: true 
    }));

    const request: google.maps.DirectionsRequest = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    // --- Make the API call ---
    directionsService.route(request, (result, status) => {
      // Clear any previous route before drawing a new one
      cleanup();

      if (status === google.maps.DirectionsStatus.OK && result) {
        const route = result.routes[0];
        if (!route) return;

        // The result contains 'legs', where each leg corresponds to one of our pathSegments.
        route.legs.forEach((leg, index) => {
          const segment = pathSegments[index];
          if (!segment) return; // Should not happen if API returns correct number of legs

          // Get styling for this specific segment based on its danger level
          const color = getDangerColor(segment.danger);
          const weight = getDangerStrokeWeight(segment.danger);
          
          // A leg's path is composed of multiple 'steps'. We combine them into a single path.
          const pathForLeg = leg.steps.flatMap(step => step.path);

          // Create and draw a new Polyline for this leg
          const polyline = new google.maps.Polyline({
            path: pathForLeg,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: weight,
            map: map,
          });

          // Store the polyline in our ref so we can clean it up on the next run
          drawnPolylinesRef.current.push(polyline);
        });

      } else {
        console.error(`[PathRenderer] Directions request failed due to ${status}`);
      }
    });

    // Return the cleanup function to be called by React when the component unmounts or props change
    return cleanup;

  }, [map, routesLibrary, pathSegments]); // Re-run effect if map, library, or path changes

  return null; // This component only renders programmatically on the map, not with JSX
};


interface MapComponentProps {
  districts: District[];
  selectedOrigin: District | null;
  selectedDestination: District | null;
  pathSegments: PathSegment[];
  onDistrictClick: (districtId: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  districts,
  selectedOrigin,
  selectedDestination,
  pathSegments,
  onDistrictClick,
  center = { lat: -12.088, lng: -77.026 }, 
  zoom = 11,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
          La API Key de Google Maps no está configurada. Por favor, establece NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env.local.
        </p>
      </div>
    );
  }

  const getMarkerIcon = (district: District) => {
    // This check ensures google.maps is available before trying to use it.
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return {
        path: 0, // 0 is the value for google.maps.SymbolPath.CIRCLE
        scale: 8,
        fillColor: selectedOrigin?.id === district.id ? '#FF9800' : (selectedDestination?.id === district.id ? '#3F51B5' : '#777777'),
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF'
      };
    }
    return undefined; // Fallback to default marker if API not ready
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['routes']}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="limaSafeRouteMap"
        className="w-full h-[calc(100vh-10rem)] lg:h-full rounded-lg shadow-lg"
      >
        {districts.map((district) => (
          <Marker
            key={district.id}
            position={{ lat: district.lat, lng: district.lng }}
            onClick={() => onDistrictClick(district.id)}
            title={district.name}
            icon={getMarkerIcon(district)}
          />
        ))}

        <PathRenderer pathSegments={pathSegments} />

        {selectedOrigin && (
          <InfoWindow position={{ lat: selectedOrigin.lat, lng: selectedOrigin.lng }}>
            <div className="p-1 font-medium">Origen: {selectedOrigin.name}</div>
          </InfoWindow>
        )}
        {selectedDestination && (
          <InfoWindow position={{ lat: selectedDestination.lat, lng: selectedDestination.lng }}>
            <div className="p-1 font-medium">Destino: {selectedDestination.name}</div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
