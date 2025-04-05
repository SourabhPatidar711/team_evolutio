import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Disaster } from "@/lib/types";

const DisasterItem = ({ disaster }: { disaster: Disaster }) => {
  const getStatusColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-primary";
      case "moderate":
        return "border-warning";
      case "monitoring":
        return "border-secondary";
      default:
        return "border-neutral-300";
    }
  };

  const getTextColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-primary";
      case "moderate":
        return "text-warning-dark";
      case "monitoring":
        return "text-secondary";
      default:
        return "text-neutral-500";
    }
  };

  const getDotColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-primary";
      case "moderate":
        return "bg-warning";
      case "monitoring":
        return "bg-secondary";
      default:
        return "bg-neutral-400";
    }
  };

  return (
    <div className={`mb-4 last:mb-0 border-l-4 ${getStatusColor(disaster.severity)} pl-3`}>
      <h4 className="font-medium text-neutral-900">{disaster.name}</h4>
      <p className="text-sm text-neutral-600">{disaster.location}</p>
      <div className="flex items-center mt-1">
        <span className={`inline-block w-2 h-2 rounded-full ${getDotColor(disaster.severity)} mr-2`}></span>
        <span className={`text-xs font-medium ${getTextColor(disaster.severity)}`}>
          {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
        </span>
        <span className="text-xs text-neutral-500 ml-auto">
          Updated {formatDistanceToNow(new Date(disaster.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

const ActiveDisasters = () => {
  const { data: disasters, isLoading, error } = useQuery<Disaster[]>({
    queryKey: ['/api/disasters/active'],
  });

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-neutral-200">
        <CardTitle className="font-heading font-semibold text-lg">Active Disasters</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3">
        {isLoading ? (
          <>
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="space-y-2 mt-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Failed to load disaster data.</p>
          </div>
        ) : disasters && disasters.length > 0 ? (
          disasters.map((disaster) => (
            <DisasterItem key={disaster.id} disaster={disaster} />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-600">No active disasters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveDisasters;
