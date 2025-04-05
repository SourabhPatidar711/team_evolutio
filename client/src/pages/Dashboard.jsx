import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart,
  Bell,
  AlertTriangle,
  MapPin,
  Users,
  ChevronRight,
  ExternalLink,
  PieChart,
  Activity,
  ChevronDown,
  Info,
  AreaChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getSeverityColor, formatNumber } from '@/lib/utils';

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Dashboard() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [activeStat, setActiveStat] = useState('overview');
  
  // Fetch dashboard data
  const { data: activeDisasters = [], isLoading: disastersLoading } = useQuery({
    queryKey: ['/api/disasters/active'],
  });
  
  const { data: recentReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/reports/recent'],
  });
  
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts/active'],
  });
  
  const { data: evacuationZones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['/api/evacuation-zones/active'],
  });
  
  // Effect for initializing selected disaster when data loads
  useEffect(() => {
    // Only run when disasters are loaded
    if (disastersLoading) return;
    
    // Select the first disaster if none is selected
    if (!selectedDisaster && activeDisasters.length > 0) {
      setSelectedDisaster(activeDisasters[0]);
    }
  }, [activeDisasters, selectedDisaster, disastersLoading]);
  
  // Placeholder data for statistics
  const statsData = {
    affectedPopulation: 15438,
    resourcesDeployed: 47,
    evacuationCenters: 8,
    firstResponders: 142
  };
  
  const severityBadgeColors = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300"
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Real-time monitoring and management of active disasters
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Disasters</p>
              <p className="text-3xl font-bold">{activeDisasters.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Affected Population</p>
              <p className="text-3xl font-bold">{formatNumber(statsData.affectedPopulation)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-3xl font-bold">{activeAlerts.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Teams</p>
              <p className="text-3xl font-bold">{statsData.firstResponders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Disaster Monitoring Map</CardTitle>
              <CardDescription>Active disasters and evacuation zones</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {disastersLoading ? (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <MapContainer 
                  center={[39.8283, -98.5795]} 
                  zoom={4} 
                  style={{ height: '400px', width: '100%' }}
                  ref={mapInstanceRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Render disaster markers */}
                  {activeDisasters.map(disaster => (
                    <Marker 
                      key={disaster.id} 
                      position={[parseFloat(disaster.latitude), parseFloat(disaster.longitude)]}
                      eventHandlers={{
                        click: () => setSelectedDisaster(disaster)
                      }}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-medium">{disaster.name}</h3>
                          <p className="text-sm">{disaster.type} - {disaster.severity}</p>
                          <p className="text-sm text-gray-600">{disaster.location}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Render evacuation zones */}
                  {evacuationZones.map(zone => (
                    <CircleMarker 
                      key={zone.id}
                      center={[parseFloat(zone.latitude), parseFloat(zone.longitude)]}
                      radius={zone.radius || 20}
                      pathOptions={{ 
                        color: zone.active ? '#e53e3e' : '#718096', 
                        fillColor: zone.active ? '#fc8181' : '#cbd5e0',
                        fillOpacity: 0.4
                      }}
                    >
                      <Tooltip direction="top" permanent={false}>
                        <div>
                          <h3 className="font-medium">{zone.name}</h3>
                          <p className="text-sm">{zone.priority} Priority</p>
                          {zone.active && <p className="text-sm text-red-600">Active Evacuation Zone</p>}
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                  
                  {/* Center on selected disaster */}
                  {selectedDisaster && (
                    <CircleMarker
                      center={[parseFloat(selectedDisaster.latitude), parseFloat(selectedDisaster.longitude)]}
                      radius={10}
                      pathOptions={{ 
                        color: '#3182ce', 
                        fillColor: '#63b3ed',
                        fillOpacity: 0.8,
                        weight: 2
                      }}
                    />
                  )}
                </MapContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Selected Disaster Details */}
          {selectedDisaster && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedDisaster.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> 
                      {selectedDisaster.location}
                    </CardDescription>
                  </div>
                  <Badge className={severityBadgeColors[selectedDisaster.severity]}>
                    {selectedDisaster.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-sm">{selectedDisaster.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                      <p className="text-sm">{selectedDisaster.type}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <p className="text-sm">{selectedDisaster.status}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Started</h3>
                      <p className="text-sm">{formatDate(selectedDisaster.startedAt, { dateStyle: 'medium' })}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                      <p className="text-sm">{formatDate(selectedDisaster.updatedAt || selectedDisaster.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Manage Response</Button>
                </div>
                
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* AI Insights Card - Optional, would require OpenAI integration */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">AI Insights & Predictions</CardTitle>
                <Badge>Powered by AI</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border border-blue-100 bg-blue-50 rounded-md">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-blue-800">Risk Analysis</h4>
                    <p className="text-sm text-blue-700">
                      Based on current weather patterns, there's a 65% chance of increased wildfire activity in the next 72 hours.
                      Recommend pre-positioning resources in high-risk zones.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm mb-1">Resource Optimization</h4>
                    <p className="text-xs text-gray-600">
                      AI suggests redistributing 3 medical teams from Zone B to Zone A based on emerging needs.
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium text-sm mb-1">Evacuation Forecast</h4>
                    <p className="text-xs text-gray-600">
                      Projected need for 2 additional evacuation centers within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                <AreaChart className="h-4 w-4 mr-2" /> View Detailed Analytics
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Activity Feed & Data Tabs */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Activity Feed</CardTitle>
                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    className={`px-3 py-1 text-xs ${activeStat === 'overview' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setActiveStat('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs ${activeStat === 'reports' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setActiveStat('reports')}
                  >
                    Reports
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs ${activeStat === 'alerts' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setActiveStat('alerts')}
                  >
                    Alerts
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-2">
              {activeStat === 'overview' && (
                <div className="space-y-4">
                  <div className="px-5 py-2 border-b">
                    <h3 className="font-medium">Recent Activity</h3>
                  </div>
                  
                  <div className="px-5 space-y-5">
                    {/* Activity items */}
                    <div className="flex gap-3">
                      <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm">New evacuation zone added for <span className="font-medium">California Wildfire</span></p>
                        <p className="text-xs text-gray-500">30 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="rounded-full h-8 w-8 bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm">Flash flood warning issued for <span className="font-medium">Riverside County</span></p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="rounded-full h-8 w-8 bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm">5 new emergency shelters activated</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="rounded-full h-8 w-8 bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <BarChart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm">Disaster severity upgraded to <span className="font-medium text-red-600">Critical</span></p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeStat === 'reports' && (
                <div className="space-y-3">
                  <div className="px-5 py-2 border-b">
                    <h3 className="font-medium">Recent Reports</h3>
                  </div>
                  
                  {reportsLoading ? (
                    <div className="px-5 py-10 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentReports.length === 0 ? (
                    <div className="px-5 py-5 text-center">
                      <p className="text-sm text-gray-500">No verified reports available</p>
                    </div>
                  ) : (
                    <div className="px-5 divide-y">
                      {recentReports.map(report => (
                        <div key={report.id} className="py-4">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-medium text-sm">{report.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {report.source}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> 
                              {report.location}
                            </div>
                            <span>{formatDate(report.createdAt, { dateStyle: 'short' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeStat === 'alerts' && (
                <div className="space-y-3">
                  <div className="px-5 py-2 border-b">
                    <h3 className="font-medium">Active Alerts</h3>
                  </div>
                  
                  {alertsLoading ? (
                    <div className="px-5 py-10 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : activeAlerts.length === 0 ? (
                    <div className="px-5 py-5 text-center">
                      <p className="text-sm text-gray-500">No active alerts at this time</p>
                    </div>
                  ) : (
                    <div className="px-5 space-y-3">
                      {activeAlerts.map(alert => (
                        <div 
                          key={alert.id}
                          className={`p-3 rounded-md border ${
                            alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                            alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between mb-1">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <Badge className={
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                              alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs mb-2">{alert.message}</p>
                          <div className="flex justify-between text-xs opacity-70">
                            <span>Area: {alert.area}</span>
                            <span>{formatDate(alert.createdAt, { dateStyle: 'short' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" size="sm" className="w-full">
                View All Activity <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Statistics Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Response Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Resources Deployed</span>
                  <span className="font-medium">{statsData.resourcesDeployed}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-primary w-[75%]"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Evacuation Centers</span>
                  <span className="font-medium">{statsData.evacuationCenters}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-primary w-[60%]"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">First Responders</span>
                  <span className="font-medium">{statsData.firstResponders}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-primary w-[85%]"></div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" /> View Full Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}