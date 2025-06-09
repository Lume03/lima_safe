
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph';
// MapPin might not be actively used by getMarkerIcon but kept for potential future use or consistency.
import { MapPin } from 'lucide-react';

// New component to handle Polyline rendering directly using google.maps.Polyline
const PathRenderer: React.FC<{ pathSegments: PathSegment[] }> = ({ pathSegments }) => {
  const map = useMap(); // Hook to get the map instance
  // useMapsLibrary hook to load additional Google Maps libraries.
  // The @vis.gl/react-google-maps Polyline component docs state it needs the 'routes' library.
  // This ensures that google.maps.Polyline is available and ready.
  const routesLibrary = useMapsLibrary('routes');
  const drawnPolylinesRef = React.useRef<google.maps.Polyline[]>([]);

  React.useEffect(() => {
    if (!map) {
      // console.log('[PathRenderer] Map instance not available yet.');
      return;
    }
    if (!routesLibrary) {
      // console.log('[PathRenderer] Routes library not loaded yet.');
      // This check also implies google.maps might not be fully ready.
      return;
    }
    // Defensive check for google.maps.Polyline constructor
    if (typeof google === 'undefined' || !google.maps || !google.maps.Polyline) {
      console.error('[PathRenderer] google.maps.Polyline constructor is not available. Path lines cannot be drawn.');
      return;
    }

    // Clear previously drawn polylines from the map and the ref
    drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
    drawnPolylinesRef.current = [];

    if (pathSegments && pathSegments.length > 0) {
      // console.log('[PathRenderer] Drawing path segments:', pathSegments.length);
      pathSegments.forEach((segment) => {
        try {
          const polylineInstance = new google.maps.Polyline({
            path: [
              { lat: segment.from.lat, lng: segment.from.lng },
              { lat: segment.to.lat, lng: segment.to.lng },
            ],
            strokeColor: getDangerColor(segment.danger),
            strokeOpacity: 0.9,
            strokeWeight: getDangerStrokeWeight(segment.danger),
            map: map, // Associate this polyline with the map instance
          });
          drawnPolylinesRef.current.push(polylineInstance);
        } catch (error) {
          console.error('[PathRenderer] Error creating Polyline for segment:', segment, error);
        }
      });
    } else {
      // console.log('[PathRenderer] No path segments to draw.');
    }

    // Cleanup function: remove polylines when component unmounts or dependencies change
    return () => {
      // console.log('[PathRenderer] Cleanup: removing polylines.');
      drawnPolylinesRef.current.forEach(polyline => polyline.setMap(null));
      drawnPolylinesRef.current = [];
    };
  }, [map, routesLibrary, pathSegments]); // Effect dependencies

  return null; // This component only interacts with the map, doesn't render DOM elements
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
  center = { lat: -12.088, lng: -77.026 }, // Centered around Lima
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
          Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
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
    return undefined; // Fallback to default marker
  };

  return (
    <APIProvider apiKey={apiKey}>
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

        {/* Use the new PathRenderer component to draw polylines */}
        <PathRenderer pathSegments={pathSegments} />

        {selectedOrigin && (
          <InfoWindow position={{ lat: selectedOrigin.lat, lng: selectedOrigin.lng }}>
            <div className="p-1 font-medium">Origin: {selectedOrigin.name}</div>
          </InfoWindow>
        )}
        {selectedDestination && (
          <InfoWindow position={{ lat: selectedDestination.lat, lng: selectedDestination.lng }}>
            <div className="p-1 font-medium">Destination: {selectedDestination.name}</div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
