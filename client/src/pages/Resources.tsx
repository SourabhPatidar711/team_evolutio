import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Resource, Disaster } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Truck, CheckCircle, MapPin, Users, Package, BriefcaseMedical, Droplets, FilePieChart, HelpCircle } from "lucide-react";
import Map from "@/components/ui/map";

interface ResourceOptimizationParams {
  disasterId: number;
  resources: { type: string; available: number }[];
  severity: number;
  populationDensity: number;
  areaSize: number;
}

interface OptimizedResource {
  type: string;
  allocated: number;
  remaining: number;
}

interface OptimizationResult {
  disasterId: number;
  optimizedResources: OptimizedResource[];
  allocationScore: string;
}

const Resources = () => {
  const { toast } = useToast();
  const [selectedDisasterId, setSelectedDisasterId] = useState<number | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // Fetch resources and disasters
  const { data: resources, isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });

  const { data: disasters, isLoading: isLoadingDisasters } = useQuery<Disaster[]>({
    queryKey: ['/api/disasters/active'],
  });

  // Select the first disaster by default
  useState(() => {
    if (disasters && disasters.length > 0 && !selectedDisasterId) {
      setSelectedDisasterId(disasters[0].id);
    }
  });

  // Filter resources by selected disaster
  const filteredResources = selectedDisasterId 
    ? resources?.filter(resource => resource.disasterId === selectedDisasterId)
    : resources;

  // Group resources by type for statistics
  const resourcesByType = filteredResources?.reduce<Record<string, number>>((acc, resource) => {
    const type = resource.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += resource.quantity;
    return acc;
  }, {});

  // Total resources deployed
  const totalDeployed = filteredResources?.reduce((sum, resource) => sum + resource.quantity, 0) || 0;

  // Selected disaster
  const selectedDisaster = disasters?.find(d => d.id === selectedDisasterId);

  // Resource optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: (params: ResourceOptimizationParams) => {
      return apiRequest("POST", "/api/ai/optimize-resources", params);
    },
    onSuccess: (data) => {
      const result = data as unknown as OptimizationResult;
      setOptimizationResult(result);
      toast({
        title: "Resource Optimization Complete",
        description: `Resources have been optimally allocated with a score of ${result.allocationScore}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize resources. Please try again.",
        variant: "destructive",
      });
    }
  });

  const runOptimization = () => {
    if (!selectedDisasterId || !selectedDisaster) return;

    // Create resource types for optimization
    const resourceTypes = [
      { type: "medical", available: 20 },
      { type: "fire", available: 25 },
      { type: "evacuation", available: 15 },
      { type: "water", available: 30 },
      { type: "food", available: 40 },
    ];

    // Get severity level from 1-10
    let severityLevel = 5; // default medium
    if (selectedDisaster.severity === "critical") severityLevel = 9;
    else if (selectedDisaster.severity === "moderate") severityLevel = 6;
    else if (selectedDisaster.severity === "monitoring") severityLevel = 3;

    // Population density is mocked for demonstration
    const populationDensity = 7; // 1-10 scale, 7 is high urban density

    optimizeMutation.mutate({
      disasterId: selectedDisasterId,
      resources: resourceTypes,
      severity: severityLevel,
      populationDensity,
      areaSize: selectedDisaster.affectedArea || 50
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "medical":
        return <BriefcaseMedical className="h-5 w-5" />;
      case "fire":
        return <Droplets className="h-5 w-5" />;
      case "evacuation":
        return <Truck className="h-5 w-5" />;
      case "shelter":
        return <Users className="h-5 w-5" />;
      case "water":
        return <Droplets className="h-5 w-5" />;
      case "food":
        return <Package className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "medical":
        return "text-red-500 bg-red-50";
      case "fire":
        return "text-amber-500 bg-amber-50";
      case "evacuation":
        return "text-blue-500 bg-blue-50";
      case "shelter":
        return "text-emerald-500 bg-emerald-50";
      case "water":
        return "text-cyan-500 bg-cyan-50";
      case "food":
        return "text-purple-500 bg-purple-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  // Map markers for resource locations
  const resourceMarkers = filteredResources?.map(resource => ({
    id: resource.id,
    position: { lat: resource.latitude, lng: resource.longitude },
    title: `${resource.name} (${resource.type})`,
  })) || [];

  // Calculate map center based on resources
  const mapCenter = filteredResources && filteredResources.length > 0
    ? {
        lat: filteredResources.reduce((sum, r) => sum + r.latitude, 0) / filteredResources.length,
        lng: filteredResources.reduce((sum, r) => sum + r.longitude, 0) / filteredResources.length
      }
    : selectedDisaster 
      ? { lat: selectedDisaster.latitude, lng: selectedDisaster.longitude }
      : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-neutral-900">Resource Management</h1>
        <p className="text-neutral-600">
          Monitor and optimize resource allocation for disaster response efforts.
        </p>
      </div>

      {/* Disaster Selector */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Select Disaster</h2>
        <div className="flex flex-wrap gap-2">
          {isLoadingDisasters ? (
            <Skeleton className="h-10 w-32" />
          ) : disasters && disasters.length > 0 ? (
            disasters.map(disaster => (
              <Button
                key={disaster.id}
                variant={selectedDisasterId === disaster.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDisasterId(disaster.id)}
                className="flex items-center"
              >
                {disaster.type === "fire" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                ) : disaster.type === "flood" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 7a1 1 0 11-2 0 1 1 0 012 0zM7 7a1 1 0 11-2 0 1 1 0 012 0zM9 13a1 1 0 102 0 1 1 0 00-2 0z" />
                    <path fillRule="evenodd" d="M7.584 9.691a3 3 0 104.832 0 5.003 5.003 0 01-2.416-1.295 5.002 5.002 0 01-2.416 1.295zM10 4c-2.392 0-4.744.78-6.667 2.222-.311.232-.583.487-.813.757a10.004 10.004 0 00-2.2 9.331c.26.666.55 1.311.872 1.93 2.518-.877 5.085-1.313 7.643-1.313S16.96 17.163 19.478 18.04c.322-.619.613-1.264.871-1.93a10.004 10.004 0 00-2.199-9.331c-.23-.27-.502-.525-.813-.757A11.959 11.959 0 0010 4zm-3.223 5.1a24.45 24.45 0 016.446 0 5.015 5.015 0 002.705-2.25c-.736-.361-1.513-.67-2.32-.921a13.978 13.978 0 00-7.216 0c-.807.251-1.584.56-2.32.921A5.015 5.015 0 006.777 9.1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <MapPin className="h-4 w-4 mr-1" />
                )}
                {disaster.name}
              </Button>
            ))
          ) : (
            <div className="text-neutral-600">No active disasters</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Resource Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle>Resource Deployment Map</CardTitle>
              <CardDescription>
                View resource locations and their proximity to the affected areas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingResources || isLoadingDisasters ? (
                <Skeleton className="h-[400px] w-full" />
              ) : !selectedDisaster ? (
                <div className="flex items-center justify-center h-[400px] bg-neutral-50">
                  <div className="text-center">
                    <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-2" />
                    <p className="text-neutral-700">Please select a disaster to view resource deployment</p>
                  </div>
                </div>
              ) : (
                <Map
                  center={mapCenter}
                  zoom={10}
                  markers={resourceMarkers}
                  height="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resource Summary */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Resource Summary</CardTitle>
            <CardDescription>
              {selectedDisaster 
                ? `Resources allocated for ${selectedDisaster.name}`
                : "Select a disaster to view allocated resources"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingResources ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : !selectedDisaster ? (
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600">Select a disaster to view resources</p>
              </div>
            ) : !filteredResources || filteredResources.length === 0 ? (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-neutral-600">No resources allocated for this disaster</p>
                <Button 
                  className="mt-4" 
                  onClick={runOptimization}
                  disabled={optimizeMutation.isPending}
                >
                  {optimizeMutation.isPending ? "Optimizing..." : "Run AI Optimization"}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-neutral-500">Total Resources</p>
                    <p className="text-2xl font-bold">{totalDeployed} Units</p>
                  </div>
                  <div className="rounded-full bg-secondary-light bg-opacity-10 p-3">
                    <FilePieChart className="h-6 w-6 text-secondary" />
                  </div>
                </div>

                <h3 className="font-medium mb-3">Resource Breakdown</h3>
                {resourcesByType && Object.entries(resourcesByType).map(([type, quantity], index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className={`rounded-full ${getResourceColor(type)} p-1.5 mr-2`}>
                          {getResourceIcon(type)}
                        </div>
                        <span className="font-medium">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </div>
                      <span>{quantity} units</span>
                    </div>
                    <Progress value={(quantity / totalDeployed) * 100} className="h-2" />
                  </div>
                ))}

                <Separator className="my-4" />

                <Button 
                  className="w-full" 
                  onClick={runOptimization}
                  disabled={optimizeMutation.isPending}
                >
                  {optimizeMutation.isPending ? "Optimizing..." : "Run AI Optimization"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <Card className="mb-6">
          <CardHeader className="p-4 bg-success/10">
            <div className="flex items-start">
              <div className="rounded-full bg-success/20 p-2 mr-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle>AI Optimization Results</CardTitle>
                <CardDescription>
                  Resource allocation optimized with score: {optimizationResult.allocationScore}/10
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizationResult.optimizedResources.map((resource, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className={`h-1 ${getResourceColor(resource.type)}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className={`rounded-full ${getResourceColor(resource.type)} p-2 mr-2`}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <h3 className="font-medium">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-neutral-500">Allocated</p>
                        <p className="text-lg font-semibold">{resource.allocated} units</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Remaining</p>
                        <p className="text-lg font-semibold">{resource.remaining} units</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Allocation</p>
                      <Progress 
                        value={(resource.allocated / (resource.allocated + resource.remaining)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Management Tabs */}
      <Tabs defaultValue="deployed" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="deployed">Deployed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deployed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingResources ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Skeleton className="h-10 w-10 rounded-full mr-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredResources && filteredResources.length > 0 ? (
              filteredResources.filter(r => r.status === "deployed").map(resource => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`rounded-full ${getResourceColor(resource.type)} p-2 mr-2`}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <h3 className="font-medium">{resource.name}</h3>
                      </div>
                      <Badge>{resource.type}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{resource.location}</p>
                    <div className="flex items-center text-sm text-neutral-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {resource.latitude.toFixed(4)}, {resource.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline" className="text-sm">
                        {resource.quantity} {resource.quantity === 1 ? "unit" : "units"}
                      </Badge>
                      <Badge variant="secondary">{resource.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 border rounded-lg border-dashed border-neutral-300 bg-neutral-50">
                <Truck className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">No Deployed Resources</h3>
                <p className="text-neutral-600 mb-4">
                  {selectedDisaster 
                    ? `No resources have been deployed for ${selectedDisaster.name} yet.`
                    : "Select a disaster to view deployed resources."}
                </p>
                {selectedDisaster && (
                  <Button onClick={runOptimization} disabled={optimizeMutation.isPending}>
                    {optimizeMutation.isPending ? "Optimizing..." : "Run AI Resource Allocation"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingResources ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Skeleton className="h-10 w-10 rounded-full mr-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredResources && filteredResources.filter(r => r.status === "available").length > 0 ? (
              filteredResources.filter(r => r.status === "available").map(resource => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`rounded-full ${getResourceColor(resource.type)} p-2 mr-2`}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <h3 className="font-medium">{resource.name}</h3>
                      </div>
                      <Badge>{resource.type}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{resource.location}</p>
                    <div className="flex items-center text-sm text-neutral-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {resource.latitude.toFixed(4)}, {resource.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline" className="text-sm">
                        {resource.quantity} {resource.quantity === 1 ? "unit" : "units"}
                      </Badge>
                      <Badge variant="secondary">{resource.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 border rounded-lg border-dashed border-neutral-300 bg-neutral-50">
                <Package className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">No Available Resources</h3>
                <p className="text-neutral-600">
                  There are no resources available for deployment at this time.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="requested" className="space-y-4">
          <div className="col-span-full text-center py-8 border rounded-lg border-dashed border-neutral-300 bg-neutral-50">
            <FilePieChart className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">Resource Requests</h3>
            <p className="text-neutral-600 mb-4">
              Emergency services can request additional resources through this portal.
            </p>
            <Button>Request Resources</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
