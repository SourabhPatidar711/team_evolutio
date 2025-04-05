import { Alert } from "@/components/ui/alert";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

const AlertBanner = () => {
  const { data: activeAlerts, isLoading, error } = useQuery({
    queryKey: ['/api/alerts/active'],
  });

  if (isLoading || error || !activeAlerts || activeAlerts.length === 0) {
    return null;
  }

  // Display the most critical alert
  const mostCriticalAlert = activeAlerts.sort((a, b) => 
    a.severity === 'critical' ? -1 : b.severity === 'critical' ? 1 : 0
  )[0];

  return (
    <Alert className="bg-warning px-4 py-2 text-white text-center rounded-none border-none">
      <span className="font-medium">ACTIVE ALERT:</span> {mostCriticalAlert.title}.{" "}
      <Link href={`/alerts/${mostCriticalAlert.id}`}>
        <a className="underline font-bold">View details</a>
      </Link>
    </Alert>
  );
};

export default AlertBanner;
