import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert as AlertType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, BellRing, Megaphone, ShieldAlert, Clock } from "lucide-react";
import AlertModal from "@/components/dashboard/AlertModal";
import Map from "@/components/ui/map";

const Alerts = () => {
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const { data: alerts, isLoading, error } = useQuery<AlertType[]>({
    queryKey: ['/api/alerts'],
  });

  // Filter alerts by status
  const activeAlerts = alerts?.filter(alert => alert.active) || [];
  const expiredAlerts = alerts?.filter(alert => !alert.active) || [];

  // Find selected alert
  const selectedAlert = selectedAlertId 
    ? alerts?.find(alert => alert.id === selectedAlertId) 
    : null;

  const handleViewDetails = (alertId: number) => {
    setSelectedAlertId(alertId);
    setShowAlertModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-primary text-white";
      case "warning":
        return "bg-warning text-white";
      case "info":
        return "bg-secondary text-white";
      default:
        return "bg-neutral-200 text-neutral-800";
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case "evacuation":
        return <ShieldAlert className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Megaphone className="h-5 w-5" />;
      default:
        return <BellRing className="h-5 w-5" />;
    }
  };

  // Get markers for the map
  const alertMarkers = activeAlerts.map(alert => ({
    id: alert.id,
    position: { lat: alert.latitude, lng: alert.longitude },
    title: alert.title,
    onClick: () => handleViewDetails(alert.id)
  }));

  // Calculate map center (average of all alert locations)
  const mapCenter = activeAlerts.length > 0
    ? {
        lat: activeAlerts.reduce((sum, alert) => sum + alert.latitude, 0) / activeAlerts.length,
        lng: activeAlerts.reduce((sum, alert) => sum + alert.longitude, 0) / activeAlerts.length
      }
    : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco if no alerts

  const renderAlertList = (alertList: AlertType[]) => {
    return alertList.length > 0 ? (
      <div className="space-y-4">
        {alertList.map((alert) => (
          <Card key={alert.id} className="overflow-hidden">
            <div className={`h-2 ${getSeverityColor(alert.severity)}`} />
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className={`rounded-full ${getSeverityColor(alert.severity)} p-2 mr-3`}>
                  {getAlertTypeIcon(alert.alertType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">{alert.title}</h3>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-neutral-600 mb-2">{alert.location}</p>
                  <p className="text-sm text-neutral-700 mb-3">{alert.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-neutral-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant={alert.severity === "critical" ? "destructive" : "secondary"}
                      onClick={() => handleViewDetails(alert.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 border rounded-lg border-dashed border-neutral-300 bg-neutral-50">
        <BellRing className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-1">No Alerts</h3>
        <p className="text-neutral-600">
          There are no {activeAlerts.length === 0 ? "active" : "expired"} alerts at this time.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-neutral-900">Emergency Alerts</h1>
        <p className="text-neutral-600">
          Stay informed about active alerts and emergency notifications in your area.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle>Alert Map</CardTitle>
              <CardDescription>
                View active alerts geographically. Click on markers for details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : error ? (
                <div className="flex items-center justify-center h-[400px] bg-neutral-50">
                  <div className="text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
                    <p className="text-neutral-700">Failed to load map data</p>
                  </div>
                </div>
              ) : (
                <Map
                  center={mapCenter}
                  zoom={8}
                  markers={alertMarkers}
                  height="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Alert Summary</CardTitle>
              <CardDescription>Current active emergency alerts</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-neutral-600">Failed to load alert data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">Active Alerts</p>
                      <p className="text-2xl font-bold">{activeAlerts.length}</p>
                    </div>
                    <div className="rounded-full bg-primary-light bg-opacity-10 p-3">
                      <BellRing className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {activeAlerts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Critical Alerts</h4>
                      {activeAlerts
                        .filter(alert => alert.severity === "critical")
                        .slice(0, 2)
                        .map(alert => (
                          <div 
                            key={alert.id}
                            className="border-l-4 border-primary pl-3 py-2 mb-2"
                          >
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-neutral-600">{alert.location}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            Active Alerts ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired Alerts ({expiredAlerts.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-1">Error Loading Alerts</h3>
              <p className="text-neutral-600 mb-4">
                There was a problem loading the alert data. Please try again.
              </p>
              <Button>Retry</Button>
            </div>
          ) : (
            renderAlertList(activeAlerts)
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-1">Error Loading Alerts</h3>
              <p className="text-neutral-600 mb-4">
                There was a problem loading the expired alert data. Please try again.
              </p>
              <Button>Retry</Button>
            </div>
          ) : (
            renderAlertList(expiredAlerts)
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Detail Modal */}
      <AlertModal 
        open={showAlertModal} 
        onOpenChange={setShowAlertModal} 
      />
    </div>
  );
};

export default Alerts;
