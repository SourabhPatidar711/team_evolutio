import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  onMapLoad?: (map: google.maps.Map) => void;
}

/**
 * A simple Google Maps component
 */
const Map = React.forwardRef<HTMLDivElement, MapProps>(
  ({ className, center, zoom = 8, markers = [], onMapLoad, ...props }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    
    // Initialize the map
    useEffect(() => {
      if (!mapRef.current) return;
      
      // Check if Google Maps API is loaded
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded');
        return;
      }
      
      const defaultCenter = center || { lat: 39.8283, lng: -98.5795 }; // Center of US
      
      try {
        // Create the map
        const mapOptions = {
          center: defaultCenter,
          zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        };
        
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        
        // Call the onMapLoad callback with the map instance
        if (onMapLoad && mapInstanceRef.current) {
          onMapLoad(mapInstanceRef.current);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, []);
    
    // Add markers to the map
    useEffect(() => {
      if (!mapInstanceRef.current || !markers.length) return;
      
      const createdMarkers: google.maps.Marker[] = [];
      
      markers.forEach(marker => {
        try {
          const newMarker = new window.google.maps.Marker({
            position: marker.position,
            map: mapInstanceRef.current,
            title: marker.title,
            ...(marker.icon && { icon: marker.icon })
          });
          
          createdMarkers.push(newMarker);
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      });
      
      // Cleanup markers when component unmounts or markers change
      return () => {
        createdMarkers.forEach(marker => marker.setMap(null));
      };
    }, [markers]);
    
    // Update map center and zoom if they change
    useEffect(() => {
      if (!mapInstanceRef.current || !center) return;
      
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }, [center, zoom]);
    
    return (
      <div 
        ref={(node) => {
          // Handle both the local ref and the forwarded ref
          mapRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("w-full h-80 bg-muted", className)}
        {...props}
      />
    );
  }
);

Map.displayName = "Map";

export { Map };