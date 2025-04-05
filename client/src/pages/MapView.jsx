import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Layers, Settings, AlertTriangle, AlertCircle, Droplets, Flame, CloudLightning, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formatDate, getSeverityColor } from '@/lib/utils';
import { getDisasterColor, createDisasterIcon, parseCoordinates } from '@/lib/mapUtils';

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip, Polygon, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = () => {
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [mapLayer, setMapLayer] = useState('street'); // 'street', 'satellite', 'terrain'
  
  // Fetch active disasters
  const { 
    data: disasters, 
    isLoading: isLoadingDisasters 
  } = useQuery({
    queryKey: ['/api/disasters/active'],
  });

  // Fetch evacuation zones for selected disaster
  const { 
    data: evacuationZones, 
    isLoading: isLoadingZones 
  } = useQuery({
    queryKey: ['/api/evacuation-zones/disaster', selectedDisaster?.id],
    enabled: !!selectedDisaster?.id,
  });

  // Fetch reports related to selected disaster
  const { 
    data: reports, 
    isLoading: isLoadingReports 
  } = useQuery({
    queryKey: ['/api/reports/disaster', selectedDisaster?.id],
    enabled: !!selectedDisaster?.id,
  });

  // Set the first disaster as selected by default when data loads
  useEffect(() => {
    if (disasters && disasters.length > 0 && !selectedDisaster) {
      setSelectedDisaster(disasters[0]);
    }
  }, [disasters, selectedDisaster]);
  
  // Helper function to safely check and return values
  const getDefaultCenter = () => {
    if (selectedDisaster && typeof selectedDisaster.latitude === 'number' && typeof selectedDisaster.longitude === 'number') {
      return [selectedDisaster.latitude, selectedDisaster.longitude];
    }
    // Default center (middle of US)
    return [39.8283, -98.5795];
  };

  // Get icon for disaster type
  const getDisasterIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
      case 'wildfire':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'flood':
      case 'flooding':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'storm':
      case 'hurricane':
        return <CloudLightning className="h-4 w-4 text-purple-500" />;
      case 'earthquake':
        return <Waves className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const MapLegend = ({ items }) => {
    return (
      <div className="absolute bottom-4 left-4 bg-white rounded shadow-lg p-3 max-w-xs text-sm z-[1000]">
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

  // Legend items for the map
  const legendItems = [
    { color: '#D32F2F', label: 'Critical Areas' },
    { color: '#FF8F00', label: 'Warning Zones' },
    { color: '#1976D2', label: 'Evacuation Routes' },
    { color: '#388E3C', label: 'Safe Zones' }
  ];

  // Render disaster markers
  const renderDisasterMarkers = () => {
    if (!disasters) return null;
    
    return disasters.map(disaster => {
      if (!disaster || typeof disaster.latitude !== 'number' || typeof disaster.longitude !== 'number') {
        return null;
      }
      
      return (
        <Marker 
          key={disaster.id}
          position={[disaster.latitude, disaster.longitude]}
          icon={createDisasterIcon(disaster.type)}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">{disaster.name}</h3>
              <p className="text-gray-600">{disaster.location}</p>
              <div className="mt-1">
                <Badge 
                  style={{ 
                    backgroundColor: getSeverityColor(disaster.severity),
                    color: 'white'
                  }}
                >
                  {disaster.severity}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="ml-1"
                >
                  {disaster.type}
                </Badge>
              </div>
              <p className="mt-2">{disaster.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                Started: {formatDate(disaster.startedAt)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  // Render evacuation zones
  const renderEvacuationZones = () => {
    if (!evacuationZones) return null;
    
    return evacuationZones.map(zone => {
      try {
        const coordinates = parseCoordinates(zone.boundaryCoordinates) || 
          parseCoordinates(`${zone.latitude},${zone.longitude}`);
        
        if (!coordinates) return null;
        
        return (
          <Polygon
            key={zone.id}
            positions={coordinates}
            pathOptions={{
              color: zone.active ? 
                (zone.priority === 'critical' ? '#DC2626' : '#EA580C') : 
                '#9CA3AF',
              fillColor: zone.active ? 
                (zone.priority === 'critical' ? '#EF444490' : '#F97316A0') : 
                '#9CA3AF80',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Tooltip direction="center" permanent>
              <div className="text-xs font-medium">
                {zone.name} ({zone.priority})
              </div>
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">{zone.name}</h3>
                <p>{zone.description}</p>
                <Badge className="mt-1">{zone.priority} priority</Badge>
                <div className="mt-2">
                  <p className="font-medium">Evacuation Instructions:</p>
                  <p className="text-xs">{zone.instructions}</p>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      } catch (error) {
        console.error("Error rendering evacuation zone:", error);
        return null;
      }
    });
  };

  // Render reports
  const renderReports = () => {
    if (!reports) return null;
    
    return reports.map(report => {
      if (!report || typeof report.latitude !== 'number' || typeof report.longitude !== 'number') {
        return null;
      }
      
      return (
        <CircleMarker
          key={report.id}
          center={[report.latitude, report.longitude]}
          radius={6}
          pathOptions={{
            color: report.status === 'verified' ? '#16A34A' : '#9CA3AF',
            fillColor: report.status === 'verified' ? '#22C55E' : '#D1D5DB',
            fillOpacity: 0.7
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">{report.title}</h3>
              <p className="text-xs text-gray-600">{report.location}</p>
              <p className="mt-1">{report.description}</p>
              <div className="mt-2">
                <Badge
                  variant={report.status === 'verified' ? 'default' : 'outline'}
                >
                  {report.status}
                </Badge>
                <Badge variant="outline" className="ml-1">
                  {report.reportType}
                </Badge>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Disaster Map View</h1>
      
      {/* Disaster selector and map controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-64">
          <p className="text-sm text-gray-500 mb-1">Select Disaster Event</p>
          <Select 
            value={selectedDisaster?.id?.toString() || ''}
            onValueChange={(value) => {
              const selected = disasters?.find(d => d.id.toString() === value);
              setSelectedDisaster(selected || null);
            }}
            disabled={isLoadingDisasters || !disasters || disasters.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select disaster" />
            </SelectTrigger>
            <SelectContent>
              {disasters && disasters.length > 0 ? (
                disasters.map(disaster => (
                  <SelectItem key={disaster.id} value={disaster.id.toString()}>
                    <div className="flex items-center">
                      {getDisasterIcon(disaster.type)}
                      <span className="ml-2">{disaster.name}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No active disasters</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <p className="text-sm text-gray-500 mb-1">Map Layer</p>
          <div className="flex space-x-2">
            <Button 
              variant={mapLayer === 'street' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMapLayer('street')}
              className="flex-1"
            >
              Street
            </Button>
            <Button 
              variant={mapLayer === 'satellite' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMapLayer('satellite')}
              className="flex-1"
            >
              Satellite
            </Button>
            <Button 
              variant={mapLayer === 'terrain' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMapLayer('terrain')}
              className="flex-1"
            >
              Terrain
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main map component */}
      <Card className="overflow-hidden mb-6">
        <CardHeader className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <div>
            <CardTitle className="font-heading font-semibold text-lg">
              {selectedDisaster ? selectedDisaster.name : 'Disaster Map'}
            </CardTitle>
            {selectedDisaster && (
              <CardDescription>
                {selectedDisaster.location} • 
                <Badge 
                  className="ml-2"
                  style={{ 
                    backgroundColor: getSeverityColor(selectedDisaster.severity),
                    color: 'white'
                  }}
                >
                  {selectedDisaster.severity}
                </Badge>
              </CardDescription>
            )}
          </div>
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
            {isLoadingDisasters ? (
              <div className="h-[70vh] flex items-center justify-center bg-neutral-100">
                <div className="text-center">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-4 w-48 mx-auto mb-2" />
                  <Skeleton className="h-3 w-36 mx-auto" />
                </div>
              </div>
            ) : disasters && disasters.length === 0 ? (
              <div className="h-[70vh] flex items-center justify-center bg-neutral-100">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-600">No disaster data available</p>
                </div>
              </div>
            ) : (
              <div className="h-[70vh]">
                <MapContainer
                  center={getDefaultCenter()}
                  zoom={selectedDisaster ? 8 : 4}
                  style={{ height: '100%', width: '100%' }}
                >
                  {/* Map Layers Control */}
                  <LayersControl position="topright">
                    {/* Base map layers */}
                    <LayersControl.BaseLayer 
                      checked={mapLayer === 'street'} 
                      name="OpenStreetMap"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                    </LayersControl.BaseLayer>
                    
                    <LayersControl.BaseLayer 
                      checked={mapLayer === 'satellite'} 
                      name="Satellite"
                    >
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                      />
                    </LayersControl.BaseLayer>
                    
                    <LayersControl.BaseLayer 
                      checked={mapLayer === 'terrain'} 
                      name="Terrain"
                    >
                      <TileLayer
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                      />
                    </LayersControl.BaseLayer>
                    
                    {/* Overlay layers */}
                    <LayersControl.Overlay checked name="Disasters">
                      <>
                        {renderDisasterMarkers()}
                      </>
                    </LayersControl.Overlay>
                    
                    {evacuationZones && (
                      <LayersControl.Overlay checked name="Evacuation Zones">
                        <>
                          {renderEvacuationZones()}
                        </>
                      </LayersControl.Overlay>
                    )}
                    
                    {reports && (
                      <LayersControl.Overlay checked name="Reports">
                        <>
                          {renderReports()}
                        </>
                      </LayersControl.Overlay>
                    )}
                  </LayersControl>
                </MapContainer>
                
                <MapLegend items={legendItems} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Additional information about selected disaster */}
      {selectedDisaster && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disaster Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center">
                    {getDisasterIcon(selectedDisaster.type)}
                    <span className="ml-2 capitalize font-medium">{selectedDisaster.type}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge>{selectedDisaster.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Started</p>
                  <p>{formatDate(selectedDisaster.startedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Affected Area</p>
                  <p>{selectedDisaster.affectedArea ? `${selectedDisaster.affectedArea} km²` : 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evacuation Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingZones ? (
                <div className="flex items-center justify-center py-6">
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : evacuationZones && evacuationZones.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Active Evacuation Zones</p>
                  <div className="space-y-2">
                    {evacuationZones
                      .filter(zone => zone.active)
                      .map(zone => (
                        <div key={zone.id} className="flex items-start">
                          <Badge style={{ backgroundColor: zone.priority === 'critical' ? '#DC2626' : '#EA580C', color: 'white' }} className="mr-2">
                            {zone.priority}
                          </Badge>
                          <div className="text-sm">
                            <p className="font-medium">{zone.name}</p>
                            <p className="text-xs text-gray-600">{zone.location}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No evacuation zones established</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-6">
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice(0, 3).map(report => (
                    <div key={report.id} className="pb-2 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">{report.title}</p>
                        <Badge variant={report.status === 'verified' ? 'default' : 'outline'} className="text-xs">
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                    </div>
                  ))}
                  {reports.length > 3 && (
                    <Button variant="link" className="px-0 py-1 h-auto text-sm">
                      View all {reports.length} reports
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No reports available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;