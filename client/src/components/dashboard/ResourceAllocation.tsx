import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, AlertCircle } from "lucide-react";
import { Resource } from "@/lib/types";

const ResourceAllocation = () => {
  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });

  const getDotColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-primary";
      case "fire":
        return "bg-warning";
      case "evacuation":
        return "bg-secondary";
      default:
        return "bg-neutral-400";
    }
  };

  // Get total deployed resources
  const totalDeployed = resources?.reduce((total, resource) => {
    return total + (resource.status === "deployed" ? 1 : 0);
  }, 0);

  // Group resources by type
  const resourcesByType = resources?.reduce<Record<string, number>>((acc, resource) => {
    const type = resource.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += resource.quantity;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-neutral-200">
        <CardTitle className="font-heading font-semibold text-lg">AI Resource Allocation</CardTitle>
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
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-200 last:border-0">
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 rounded-full mr-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Failed to load resource data.</p>
          </div>
        ) : resources && resources.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-neutral-500">Optimized Deployment</span>
                <div className="text-2xl font-medium">{totalDeployed} Units</div>
              </div>
              <div className="rounded-full bg-secondary-light bg-opacity-10 p-3">
                <ClipboardList className="h-6 w-6 text-secondary" />
              </div>
            </div>

            <div className="space-y-3">
              {resourcesByType && Object.entries(resourcesByType).map(([type, quantity], index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-200 last:border-0">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${getDotColor(type)} mr-2`}></span>
                    <span className="text-sm font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)} {type === "medical" ? "Teams" : type === "fire" ? "Response" : "Transport"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{quantity}</span>
                    <span className="text-neutral-500"> units deployed</span>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline">
              View Allocation Details
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-600">No resources allocated.</p>
            <Button className="mt-4" variant="outline">
              Request Resources
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceAllocation;
