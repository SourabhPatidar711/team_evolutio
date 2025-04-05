import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Settings, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { initMap, addDisasterMarker, createHeatmap, drawEvacuationZones } from "@/lib/mapUtils";

const DisasterInfo = ({ disaster }) => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded shadow-lg p-4 max-w-xs">
      <div className="flex items-center mb-2">
        <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2 animate-pulse"></span>
        <h4 className="font-medium text-neutral-900">{disaster.name} - {disaster.location}</h4>
      </div>
      <p className="text-sm text-neutral-700 mb-3">{disaster.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="text-neutral-500 block">Severity</span>
          <span className="font-medium">
            {disaster.severity === "critical" ? "Critical (Level 4)" : 
             disaster.severity === "moderate" ? "Moderate (Level 3)" : 
             "Monitoring (Level 2)"}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block">Affected Area</span>
          <span className="font-medium">{disaster.affectedArea} sq miles</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Detection</span>
          <span className="font-medium">{disaster.detectionSource}</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Started</span>
          <span className="font-medium">
            {new Date(disaster.startedAt).toLocaleDateString()} {new Date(disaster.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Button className="w-full" variant="destructive">
          View Evacuation Routes
        </Button>
        <Button className="w-full" variant="outline">
          Resource Status
        </Button>
      </div>
    </div>
  );
};

const MapLegend = ({ items }) => {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded shadow-lg p-3 max-w-xs text-sm">
      <h4 className="font-medium mb-2">Map Legend</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <span 
              className="inline-block w-4 h-4 rounded-sm mr-2" 
              style={{ backgroundColor: item.color }}
            ></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DisasterMap = () => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: disasters, isLoading: isLoadingDisasters } = useQuery({
    queryKey: ['/api/disasters/active'],
  });

  const { data: evacuationZones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['/api/evacuation-zones/active'],
    enabled: mapLoaded && !!disasters && disasters.length > 0,
  });

  // Initialize Google Maps
  useEffect(() => {
    // Load Google Maps JavaScript API script dynamically
    const loadGoogleMapsScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=visualization,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize map and add markers when data and map are loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && disasters && disasters.length > 0) {
      // Initialize map centered on the first disaster
      const firstDisaster = disasters[0];
      const center = { lat: firstDisaster.latitude, lng: firstDisaster.longitude };
      googleMapRef.current = initMap(mapRef.current, center);

      // Add disaster markers
      disasters.forEach(disaster => {
        addDisasterMarker(googleMapRef.current, disaster, () => {
          setSelectedDisaster(disaster);
        });
      });

      // Create heatmap for severity
      createHeatmap(
        googleMapRef.current, 
        disasters.map(d => ({ 
          location: new window.google.maps.LatLng(d.latitude, d.longitude), 
          weight: d.severity === 'critical' ? 1 : d.severity === 'moderate' ? 0.7 : 0.4 
        }))
      );

      // Set the first disaster as selected by default
      setSelectedDisaster(firstDisaster);
    }
  }, [mapLoaded, disasters]);

  // Draw evacuation zones when available
  useEffect(() => {
    if (googleMapRef.current && evacuationZones && evacuationZones.length > 0) {
      drawEvacuationZones(googleMapRef.current, evacuationZones);
    }
  }, [evacuationZones]);

  const legendItems = [
    { color: '#D32F2F', label: 'Critical Areas' },
    { color: '#FF8F00', label: 'Warning Zones' },
    { color: '#1976D2', label: 'Evacuation Routes' },
    { color: '#388E3C', label: 'Safe Zones' }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-lg">Disaster Map</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8">
            <Layers className="h-4 w-4 mr-1" />
            Layers
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Settings className="h-4 w-4 mr-1" />
            Options
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {(isLoadingDisasters || !mapLoaded) ? (
            <div className="h-[60vh] md:h-[60vh] flex items-center justify-center bg-neutral-100">
              <div className="text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-48 mx-auto mb-2" />
                <Skeleton className="h-3 w-36 mx-auto" />
              </div>
            </div>
          ) : disasters && disasters.length === 0 ? (
            <div className="h-[60vh] md:h-[60vh] flex items-center justify-center bg-neutral-100">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600">No disaster data available</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="h-[60vh] md:h-[60vh]"></div>
          )}

          {selectedDisaster && mapLoaded && (
            <DisasterInfo disaster={selectedDisaster} />
          )}

          {mapLoaded && (
            <MapLegend items={legendItems} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
