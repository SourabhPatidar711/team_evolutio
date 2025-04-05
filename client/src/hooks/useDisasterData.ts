import { useQuery } from "@tanstack/react-query";
import { Disaster, Prediction, Report, Resource, EvacuationZone, Alert } from "@/lib/types";

/**
 * Custom hook to fetch active disasters
 * @returns Query result for active disasters
 */
export function useActiveDisasters() {
  return useQuery<Disaster[]>({
    queryKey: ['/api/disasters/active'],
  });
}

/**
 * Custom hook to fetch disaster by ID
 * @param id The disaster ID
 * @returns Query result for the specific disaster
 */
export function useDisaster(id: number | null) {
  return useQuery<Disaster>({
    queryKey: ['/api/disasters', id],
    enabled: id !== null,
  });
}

/**
 * Custom hook to fetch all predictions
 * @returns Query result for predictions
 */
export function usePredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['/api/predictions'],
  });
}

/**
 * Custom hook to fetch evacuation zones for a disaster
 * @param disasterId The disaster ID
 * @returns Query result for evacuation zones
 */
export function useEvacuationZones(disasterId: number | null) {
  return useQuery<EvacuationZone[]>({
    queryKey: ['/api/evacuation-zones/disaster', disasterId],
    enabled: disasterId !== null,
  });
}

/**
 * Custom hook to fetch active evacuation zones
 * @returns Query result for active evacuation zones
 */
export function useActiveEvacuationZones() {
  return useQuery<EvacuationZone[]>({
    queryKey: ['/api/evacuation-zones/active'],
  });
}

/**
 * Custom hook to fetch resources for a disaster
 * @param disasterId The disaster ID
 * @returns Query result for resources
 */
export function useDisasterResources(disasterId: number | null) {
  return useQuery<Resource[]>({
    queryKey: ['/api/resources/disaster', disasterId],
    enabled: disasterId !== null,
  });
}

/**
 * Custom hook to fetch all resources
 * @returns Query result for all resources
 */
export function useAllResources() {
  return useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });
}

/**
 * Custom hook to fetch reports for a disaster
 * @param disasterId The disaster ID
 * @returns Query result for disaster reports
 */
export function useDisasterReports(disasterId: number | null) {
  return useQuery<Report[]>({
    queryKey: ['/api/reports/disaster', disasterId],
    enabled: disasterId !== null,
  });
}

/**
 * Custom hook to fetch recent verified reports
 * @param limit Number of reports to fetch (default: 3)
 * @returns Query result for recent reports
 */
export function useRecentReports(limit: number = 3) {
  return useQuery<Report[]>({
    queryKey: ['/api/reports/recent', { limit }],
  });
}

/**
 * Custom hook to fetch active alerts
 * @returns Query result for active alerts
 */
export function useActiveAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['/api/alerts/active'],
  });
}

/**
 * Custom hook to fetch all alerts
 * @returns Query result for all alerts
 */
export function useAllAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });
}

/**
 * Custom hook to combine multiple disaster data sources
 * @param disasterId Optional disaster ID to filter related data
 * @returns Combined query results for disaster data
 */
export function useDisasterDashboardData(disasterId: number | null = null) {
  const activeDisasters = useActiveDisasters();
  const predictions = usePredictions();
  const evacuationZones = disasterId 
    ? useEvacuationZones(disasterId) 
    : useActiveEvacuationZones();
  const resources = disasterId 
    ? useDisasterResources(disasterId) 
    : useAllResources();
  const reports = useRecentReports();
  const alerts = useActiveAlerts();

  const isLoading = 
    activeDisasters.isLoading || 
    predictions.isLoading || 
    evacuationZones.isLoading || 
    resources.isLoading || 
    reports.isLoading || 
    alerts.isLoading;

  const error = 
    activeDisasters.error || 
    predictions.error || 
    evacuationZones.error || 
    resources.error || 
    reports.error || 
    alerts.error;

  return {
    activeDisasters: activeDisasters.data,
    predictions: predictions.data,
    evacuationZones: evacuationZones.data,
    resources: resources.data,
    reports: reports.data,
    alerts: alerts.data,
    isLoading,
    error,
  };
}
