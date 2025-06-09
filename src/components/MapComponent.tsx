
// Ensure you have a .env.local file with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import type { District, PathSegment } from '@/types';
import { getDangerColor } from '@/lib/graph';
import { MapPin } from 'lucide-react';

// Dynamically import Polyline with a fallback
const Polyline = dynamic(
  async () => {
    try {
      const mod = await import('@vis.gl/react-google-maps');
      if (mod && (typeof mod.Polyline === 'function' || typeof mod.Polyline === 'object')) {
        // Check if it's a function (class/functional component) or an object (e.g. from forwardRef)
        return mod.Polyline;
      }
      console.warn(
        '@vis.gl/react-google-maps: Polyline component not found or invalid. Polylines will not be rendered. Module content:',
        mod
      );
    } catch (error) {
      console.error('Error importing Polyline from @vis.gl/react-google-maps:', error);
    }
    // Return a dummy component that renders nothing if Polyline is not found or fails to import
    return () => null;
  },
  { ssr: false }
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

        {pathSegments.map((segment, index) => (
          <Polyline
            key={`path-segment-${index}`}
            path={[
              { lat: segment.from.lat, lng: segment.from.lng },
              { lat: segment.to.lat, lng: segment.to.lng },
            ]}
            strokeColor={getDangerColor(segment.danger)}
            strokeOpacity={0.8}
            strokeWeight={6}
          />
        ))}

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
