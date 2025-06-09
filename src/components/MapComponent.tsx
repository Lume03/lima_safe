
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types'; 
import { getDangerColor, getDangerStrokeWeight } from '@/lib/graph';
import { MapPin } from 'lucide-react';

// Simplified local PolylineProps type definition
type PolylineProps = {
    path?: google.maps.LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    children?: React.ReactNode;
    key?: React.Key; // Ensure key is allowed
    [key: string]: any; // Allow other props that the underlying component might accept
};

const Polyline = dynamic<PolylineProps>(
  () =>
    import('@vis.gl/react-google-maps')
      .then(mod => {
        if (mod && typeof mod.Polyline === 'function') {
          console.log('[MapComponent] Polyline component successfully loaded dynamically.');
          return mod.Polyline as React.ComponentType<PolylineProps>;
        }
        
        let availableKeysMessage = 'module object was not available or was empty.';
        if (mod && typeof mod === 'object' && mod !== null) {
          try {
            availableKeysMessage = `Available module keys: ${Object.keys(mod).join(', ')}`;
          } catch (e) {
            availableKeysMessage = 'Error getting keys from module object.';
          }
        }
        console.error(
          `[MapComponent] Polyline component NOT loaded. Reason: 'Polyline' not found as a function in @vis.gl/react-google-maps module. ${availableKeysMessage}. Path lines will NOT be rendered.`
        );
        const FallbackPolyline: React.FC<PolylineProps> = (_props) => {
            console.warn('[MapComponent] FallbackPolyline rendered because Polyline could not be loaded. Path data:', _props.path);
            return null; 
        };
        return FallbackPolyline; 
      })
      .catch(error => {
        console.error('[MapComponent] CRITICAL ERROR during dynamic import of @vis.gl/react-google-maps for Polyline:', error, '. Path lines will NOT be rendered.');
        const ErrorFallbackPolyline: React.FC<PolylineProps> = (_props) => {
            console.warn('[MapComponent] ErrorFallbackPolyline rendered due to import error. Path data:', _props.path);
            return null; 
        };
        return ErrorFallbackPolyline; 
      }),
  { 
    ssr: false,
    loading: () => {
      // console.log('[MapComponent] Polyline component is loading...'); 
      return null; 
    }
  }
);

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
    console.log('[MapComponent] pathSegments received:', JSON.stringify(pathSegments, null, 2));
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

        {pathSegments && pathSegments.length > 0 && Polyline ? (
          pathSegments.map((segment, index) => {
            // Check if Polyline is a valid component before rendering
            if (typeof Polyline !== 'function' && typeof Polyline !== 'object') { // object for React.forwardRef components
              console.error("[MapComponent] Polyline is not a function or valid component, cannot render path segment.");
              return null;
            }
            return (
              <Polyline 
                key={`path-segment-${index}`}
                path={[
                  { lat: segment.from.lat, lng: segment.from.lng },
                  { lat: segment.to.lat, lng: segment.to.lng },
                ]}
                strokeColor={getDangerColor(segment.danger)}
                strokeOpacity={0.9}
                strokeWeight={getDangerStrokeWeight(segment.danger)}
              />
            );
          })
        ): (
          pathSegments && pathSegments.length > 0 && (
            // This case means Polyline component itself is falsy (e.g., resolved to null from fallback)
            // The fallback components (FallbackPolyline, ErrorFallbackPolyline) already log messages.
             <></> 
          )
        )}

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
