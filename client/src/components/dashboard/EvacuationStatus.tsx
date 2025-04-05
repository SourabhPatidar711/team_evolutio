import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, AlertCircle } from "lucide-react";
import { EvacuationZone } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const EvacuationStatus = () => {
  const { data: evacuationZones, isLoading, error } = useQuery<EvacuationZone[]>({
    queryKey: ['/api/evacuation-zones/active'],
  });

  const getTextColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-primary";
      case "warning":
        return "text-warning";
      default:
        return "text-neutral-500";
    }
  };

  const getProgressColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-primary";
      case "warning":
        return "bg-warning";
      default:
        return "bg-neutral-400";
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-neutral-200">
        <CardTitle className="font-heading font-semibold text-lg">Evacuation Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Failed to load evacuation data.</p>
          </div>
        ) : evacuationZones && evacuationZones.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-neutral-500">Active Evacuations</span>
                <div className="text-2xl font-medium">{evacuationZones.length} Zones</div>
              </div>
              <div className="rounded-full bg-primary-light bg-opacity-10 p-3">
                <LogOut className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="space-y-3">
              {evacuationZones.map((zone) => (
                <div key={zone.id}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {zone.name} ({zone.priority.charAt(0).toUpperCase() + zone.priority.slice(1)})
                    </span>
                    <span className={`text-sm font-medium ${getTextColor(zone.priority)}`}>
                      {zone.completionPercentage}% Complete
                    </span>
                  </div>
                  <Progress 
                    value={zone.completionPercentage} 
                    className="h-2 mt-1 bg-neutral-200" 
                    indicatorClassName={getProgressColor(zone.priority)}
                  />
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline">
              View Detailed Status
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-600">No active evacuations.</p>
            <Button className="mt-4" variant="outline">
              View Evacuation Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvacuationStatus;
