
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph';
import { MapPin } from 'lucide-react';

// Refactored component to render the entire path with a single Directions API call using waypoints
const PathRenderer: React.FC<{ pathSegments: PathSegment[] }> = ({ pathSegments }) => {
  const map = useMap(); 
  const routesLibrary = useMapsLibrary('routes');
  const directionsServiceRef = React.useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = React.useRef<google.maps.DirectionsRenderer | null>(null);

  React.useEffect(() => {
    if (!map || !routesLibrary || typeof google === 'undefined' || !google.maps) {
      console.error('[PathRenderer] Google Maps API or required libraries not available.');
      return;
    }

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We use our own markers
        polylineOptions: {
            strokeColor: getDangerColor(3), // Default color, can be adjusted
            strokeOpacity: 0.9,
            strokeWeight: 6,
        }
      });
    }
    
    const directionsRenderer = directionsRendererRef.current;
    directionsRenderer.setMap(map);

    if (!pathSegments || pathSegments.length === 0) {
      directionsRenderer.setDirections({routes: []}); // Clear the route from the map
      return;
    }

    const directionsService = directionsServiceRef.current;
    
    const origin = pathSegments[0].from;
    const destination = pathSegments[pathSegments.length - 1].to;
    
    // Waypoints are all the intermediate points in the path
    const waypoints: google.maps.DirectionsWaypoint[] = pathSegments.slice(0, -1).map(segment => ({
      location: { lat: segment.to.lat, lng: segment.to.lng },
      stopover: false // true if you want a marker for each waypoint, false for just routing through
    }));

    const request: google.maps.DirectionsRequest = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        // Here you could potentially color segments differently, but it's more complex
        // with a single DirectionsRenderer. For now, the whole route has one style.
      } else {
        console.error(`[PathRenderer] Directions request failed due to ${status}`);
        // Clear previous route if the new one fails
        directionsRenderer.setDirections({routes: []});
      }
    });

    return () => {
      // Clean up renderer when component unmounts or path changes
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [map, routesLibrary, pathSegments]); 

  return null; 
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
        path: 0, // window.google.maps.SymbolPath.CIRCLE
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
