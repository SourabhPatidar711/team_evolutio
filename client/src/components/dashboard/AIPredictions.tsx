import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Flame, Droplets } from "lucide-react";
import { Prediction } from "@/lib/types";
import { Link } from "wouter";

const PredictionItem = ({ prediction }: { prediction: Prediction }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "fire":
        return (
          <div className="rounded-full bg-neutral-100 p-2 mr-3">
            <Flame className="h-5 w-5 text-warning" />
          </div>
        );
      case "flood":
        return (
          <div className="rounded-full bg-neutral-100 p-2 mr-3">
            <Droplets className="h-5 w-5 text-secondary" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-neutral-100 p-2 mr-3">
            <AlertCircle className="h-5 w-5 text-neutral-500" />
          </div>
        );
    }
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-start">
        {getIcon(prediction.disasterType)}
        <div>
          <h4 className="font-medium text-neutral-900">
            {prediction.disasterType.charAt(0).toUpperCase() + prediction.disasterType.slice(1)} Risk - {Math.round(prediction.probability * 100)}% Probability
          </h4>
          <p className="text-sm text-neutral-600">
            {prediction.location}, predicted within {prediction.timeFrame}
          </p>
          <div className="flex text-xs text-neutral-500 mt-1">
            <span>Based on {prediction.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIPredictions = () => {
  const { data: predictions, isLoading, error } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions'],
  });

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-neutral-200">
        <CardTitle className="font-heading font-semibold text-lg">AI Predictions</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3">
        {isLoading ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex">
                <Skeleton className="h-9 w-9 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <Skeleton className="h-9 w-9 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Failed to load prediction data.</p>
          </div>
        ) : predictions && predictions.length > 0 ? (
          <>
            {predictions.slice(0, 2).map((prediction) => (
              <PredictionItem key={prediction.id} prediction={prediction} />
            ))}
            <Link href="/predictions">
              <a className="block text-center text-sm text-secondary font-medium mt-3 hover:underline">
                View all predictions
              </a>
            </Link>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-600">No predictions available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPredictions;
