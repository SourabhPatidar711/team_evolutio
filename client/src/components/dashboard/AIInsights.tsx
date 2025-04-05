import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, CheckCircle, AlertCircle, Flame, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Disaster } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get insight data based on disaster
const getInsightData = (disaster: Disaster) => {
  switch (disaster.type) {
    case "fire":
      return {
        severity: {
          icon: <MapPin className="h-8 w-8 text-warning" />,
          title: "Severity Analysis",
          description: `AI analysis of current ${disaster.name.toLowerCase()} shows highest severity in northern regions with potential to impact 12 communities.`,
          insights: [
            "Wind patterns shifting north at 15-20 mph",
            "Critical infrastructure at risk within 6 hours",
            "Suggested evacuation for zones A, B, and C"
          ],
          buttonText: "View Full Analysis",
          buttonColor: "bg-warning hover:bg-warning-dark"
        },
        evacuation: {
          icon: <Navigation className="h-8 w-8 text-secondary" />,
          title: "Evacuation Planning",
          description: "AI has generated optimized evacuation routes considering real-time traffic, road closures, and population density.",
          insights: [
            "Route 101 North: Clear and recommended",
            "Highway 15 East: Heavy congestion, avoid",
            "County Road 7: Open for emergency vehicles only"
          ],
          buttonText: "View Routes",
          buttonColor: "bg-secondary hover:bg-secondary-dark"
        },
        resources: {
          icon: <CheckCircle className="h-8 w-8 text-success" />,
          title: "Resource Optimization",
          description: "AI has calculated optimal resource allocation based on population density, infrastructure, and disaster severity.",
          insights: [
            "Medical: Veterans Hospital (zone B-4)",
            "Shelter: Central High School (capacity 2,400)",
            "Water: Distribution center needed in zone C-7"
          ],
          buttonText: "View Resources",
          buttonColor: "bg-success hover:bg-success-light"
        }
      };
    case "flood":
      return {
        severity: {
          icon: <Droplets className="h-8 w-8 text-secondary" />,
          title: "Flood Severity Analysis",
          description: `AI analysis of current flooding shows potential impact to lowland areas with ${Math.round(disaster.affectedArea)} sq miles at risk.`,
          insights: [
            "Rising water levels expected to peak in 24 hours",
            "Dam capacity at 87% and holding",
            "Suggested evacuation for coastal zones"
          ],
          buttonText: "View Full Analysis",
          buttonColor: "bg-secondary hover:bg-secondary-dark"
        },
        evacuation: {
          icon: <Navigation className="h-8 w-8 text-secondary" />,
          title: "Evacuation Planning",
          description: "AI has generated flood-aware evacuation routes avoiding low-lying areas and damaged infrastructure.",
          insights: [
            "Highway 95 South: Clear and recommended",
            "Coastal Route 1: Flooded in sections, avoid",
            "Evacuation shelters prepared for 15,000 residents"
          ],
          buttonText: "View Routes",
          buttonColor: "bg-secondary hover:bg-secondary-dark"
        },
        resources: {
          icon: <CheckCircle className="h-8 w-8 text-success" />,
          title: "Resource Optimization",
          description: "AI has calculated optimal resource allocation for flood response efforts.",
          insights: [
            "Water pumps: Deployed to zones A-2 and B-5",
            "Rescue boats: Positioned at strategic access points",
            "Emergency supplies distributed to 12 shelter locations"
          ],
          buttonText: "View Resources",
          buttonColor: "bg-success hover:bg-success-light"
        }
      };
    default:
      return {
        severity: {
          icon: <AlertCircle className="h-8 w-8 text-warning" />,
          title: "Severity Analysis",
          description: `AI analysis of the ${disaster.type} impact shows moderate severity with potential for escalation.`,
          insights: [
            "Monitoring key infrastructure points",
            "Emergency services on standby",
            "Periodic updates scheduled every 30 minutes"
          ],
          buttonText: "View Full Analysis",
          buttonColor: "bg-warning hover:bg-warning-dark"
        },
        evacuation: {
          icon: <Navigation className="h-8 w-8 text-secondary" />,
          title: "Evacuation Planning",
          description: "Precautionary evacuation plans have been generated for vulnerable areas.",
          insights: [
            "Main highways remain open and clear",
            "Public transportation operating normally",
            "Shelter capacity prepared for potential needs"
          ],
          buttonText: "View Routes",
          buttonColor: "bg-secondary hover:bg-secondary-dark"
        },
        resources: {
          icon: <CheckCircle className="h-8 w-8 text-success" />,
          title: "Resource Optimization",
          description: "Resources are staged and ready for rapid deployment if needed.",
          insights: [
            "Emergency response teams positioned strategically",
            "Medical supplies prepositioned at key facilities",
            "Communication channels confirmed operational"
          ],
          buttonText: "View Resources",
          buttonColor: "bg-success hover:bg-success-light"
        }
      };
  }
};

const InsightCard = ({ 
  icon, 
  title, 
  description, 
  insights, 
  buttonText, 
  buttonColor 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  insights: string[];
  buttonText: string;
  buttonColor: string;
}) => {
  return (
    <Card className="bg-white rounded-lg shadow p-4">
      <CardContent className="p-0">
        <div className="flex items-center mb-3">
          {icon}
          <h3 className="font-heading font-semibold text-lg ml-2">{title}</h3>
        </div>
        <p className="text-neutral-600 mb-3">{description}</p>
        <div className="bg-neutral-100 p-3 rounded text-sm mb-4">
          <div className="font-medium mb-1">Key Insights:</div>
          <ul className="list-disc list-inside text-neutral-700 space-y-1">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
        <Button className={`w-full text-white ${buttonColor} rounded py-2 text-sm font-medium`}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const AIInsights = () => {
  const { data: disasters, isLoading, error } = useQuery<Disaster[]>({
    queryKey: ['/api/disasters/active'],
  });

  // Use the first active disaster for insights
  const activeDisaster = disasters && disasters.length > 0 ? disasters[0] : null;
  const insightData = activeDisaster ? getInsightData(activeDisaster) : null;

  if (isLoading) {
    return (
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white rounded-lg shadow p-4">
              <CardContent className="p-0">
                <div className="flex items-center mb-3">
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6 mb-3" />
                <Skeleton className="h-24 w-full mb-4 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !activeDisaster) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-heading font-bold mb-4">AI-Powered Insights</h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">Unable to Load Insights</h3>
          <p className="text-neutral-600 mb-4">
            {error ? "There was an error loading the AI insights. Please try again later." 
            : "No active disasters to analyze. Insights will appear when a disaster is detected."}
          </p>
          <Button>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-heading font-bold mb-4">AI-Powered Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          icon={insightData.severity.icon}
          title={insightData.severity.title}
          description={insightData.severity.description}
          insights={insightData.severity.insights}
          buttonText={insightData.severity.buttonText}
          buttonColor={insightData.severity.buttonColor}
        />
        <InsightCard
          icon={insightData.evacuation.icon}
          title={insightData.evacuation.title}
          description={insightData.evacuation.description}
          insights={insightData.evacuation.insights}
          buttonText={insightData.evacuation.buttonText}
          buttonColor={insightData.evacuation.buttonColor}
        />
        <InsightCard
          icon={insightData.resources.icon}
          title={insightData.resources.title}
          description={insightData.resources.description}
          insights={insightData.resources.insights}
          buttonText={insightData.resources.buttonText}
          buttonColor={insightData.resources.buttonColor}
        />
      </div>
    </div>
  );
};

export default AIInsights;
