
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph';
import { MapPin } from 'lucide-react';

// New component to handle Polyline rendering using Google Maps Directions Service
const PathRenderer: React.FC<{ pathSegments: PathSegment[] }> = ({ pathSegments }) => {
  const map = useMap(); 
  const routesLibrary = useMapsLibrary('routes'); // Ensures DirectionsService is available
  const directionsServiceRef = React.useRef<google.maps.DirectionsService | null>(null);
  const drawnPolylinesRef = React.useRef<google.maps.Polyline[]>([]);

  React.useEffect(() => {
    if (!map || !routesLibrary || typeof google === 'undefined' || !google.maps || !google.maps.Polyline || !google.maps.DirectionsService) {
      console.error('[PathRenderer] Google Maps API or required libraries not available. Path lines cannot be drawn.');
      return;
    }

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }
    const directionsService = directionsServiceRef.current;

    // Clear existing polylines
    drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
    drawnPolylinesRef.current = [];

    if (pathSegments && pathSegments.length > 0) {
      pathSegments.forEach((segment, index) => {
        const request: google.maps.DirectionsRequest = {
          origin: { lat: segment.from.lat, lng: segment.from.lng },
          destination: { lat: segment.to.lat, lng: segment.to.lng },
          travelMode: google.maps.TravelMode.DRIVING, // You can change this (WALKING, BICYCLING)
        };

        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result && result.routes && result.routes.length > 0) {
            try {
              const routePath = result.routes[0].overview_path;
              const polylineInstance = new google.maps.Polyline({
                path: routePath,
                strokeColor: getDangerColor(segment.danger),
                strokeOpacity: 0.9,
                strokeWeight: getDangerStrokeWeight(segment.danger),
                map: map,
              });
              drawnPolylinesRef.current.push(polylineInstance);
            } catch (error) {
               console.error(`[PathRenderer] Error creating Polyline for segment ${index} from DirectionsResult:`, segment, error);
            }
          } else {
            console.error(`[PathRenderer] Directions request failed for segment ${index} due to ${status}. Falling back to straight line.`);
            // Fallback to straight line if DirectionsService fails for a segment
            try {
              const fallbackPolyline = new google.maps.Polyline({
                path: [
                  { lat: segment.from.lat, lng: segment.from.lng },
                  { lat: segment.to.lat, lng: segment.to.lng },
                ],
                strokeColor: getDangerColor(segment.danger),
                strokeOpacity: 0.7, // Slightly more transparent for fallback
                strokeWeight: getDangerStrokeWeight(segment.danger) -1, // Slightly thinner for fallback
                geodesic: true,
                map: map,
              });
              drawnPolylinesRef.current.push(fallbackPolyline);
            } catch (error) {
              console.error(`[PathRenderer] Error creating fallback Polyline for segment ${index}:`, segment, error);
            }
          }
        });
      });
    }

    return () => {
      drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
      drawnPolylinesRef.current = [];
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

  React.useEffect(() => {
    // console.log('[MapComponent] pathSegments received:', JSON.stringify(pathSegments, null, 2));
  }, [pathSegments]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
          La API Key de Google Maps no está configurada. Por favor, establece NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu entorno.
        </p>
      </div>
    );
  }

  const getMarkerIcon = (district: District) => {
    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.SymbolPath &&
      typeof window.google.maps.SymbolPath.CIRCLE !== 'undefined'
    ) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: selectedOrigin?.id === district.id ? '#FF9800' : (selectedDestination?.id === district.id ? '#3F51B5' : '#777777'),
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF'
      };
    }
    // Fallback to default marker if SymbolPath is not ready
    return undefined; 
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['routes']}> {/* Ensure 'routes' library is loaded here */}
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

