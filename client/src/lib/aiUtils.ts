import { apiRequest } from "./queryClient";

/**
 * Interface for disaster prediction parameters
 */
interface DisasterPredictionParams {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  disasterType: "fire" | "flood" | "earthquake" | "storm";
}

/**
 * Interface for disaster prediction result
 */
interface DisasterPredictionResult {
  disasterType: string;
  probability: number;
  location: string;
  timeFrame: string;
}

/**
 * Interface for resource optimization parameters
 */
interface ResourceOptimizationParams {
  disasterId: number;
  resources: { type: string; available: number }[];
  severity: number;
  populationDensity: number;
  areaSize: number;
}

/**
 * Interface for resource optimization result
 */
interface ResourceOptimizationResult {
  disasterId: number;
  optimizedResources: { type: string; allocated: number; remaining: number }[];
  allocationScore: string;
}

/**
 * Make a disaster prediction using AI
 * @param params The prediction parameters
 * @returns A Promise resolving to the prediction result
 */
export async function predictDisaster(
  params: DisasterPredictionParams
): Promise<DisasterPredictionResult> {
  try {
    const response = await apiRequest("POST", "/api/ai/predict", params);
    return await response.json();
  } catch (error) {
    console.error("Error making disaster prediction:", error);
    throw error;
  }
}

/**
 * Optimize resource allocation using AI
 * @param params The optimization parameters
 * @returns A Promise resolving to the optimization result
 */
export async function optimizeResources(
  params: ResourceOptimizationParams
): Promise<ResourceOptimizationResult> {
  try {
    const response = await apiRequest("POST", "/api/ai/optimize-resources", params);
    return await response.json();
  } catch (error) {
    console.error("Error optimizing resources:", error);
    throw error;
  }
}

/**
 * Calculate disaster severity score based on various factors
 * @param factors Object containing severity factors
 * @returns A severity score between 0 and 1
 */
export function calculateDisasterSeverity(factors: {
  intensity: number; // 0-10
  populationDensity: number; // 0-10
  infrastructure: number; // 0-10
  weatherConditions: number; // 0-10
}): number {
  const { intensity, populationDensity, infrastructure, weatherConditions } = factors;
  
  // Weights for each factor (sum to 1)
  const weights = {
    intensity: 0.4,
    populationDensity: 0.3,
    infrastructure: 0.2,
    weatherConditions: 0.1,
  };
  
  // Calculate weighted score
  const score = 
    (intensity * weights.intensity) +
    (populationDensity * weights.populationDensity) +
    (infrastructure * weights.infrastructure) +
    (weatherConditions * weights.weatherConditions);
  
  // Normalize to 0-1 range
  return score / 10;
}

/**
 * Analyze social media data for disaster sentiment
 * This is a simplified version for demonstration purposes
 * @param text The text to analyze
 * @returns An object with sentiment scores
 */
export function analyzeSocialMediaSentiment(text: string): {
  urgency: number;
  severity: number;
  fear: number;
  reliability: number;
} {
  // This is a simplified demonstration - in a real implementation,
  // this would use NLP and ML to analyze text sentiment
  
  // Example implementation:
  const urgencyTerms = ['immediately', 'urgent', 'emergency', 'now', 'hurry', 'asap'];
  const severityTerms = ['severe', 'massive', 'huge', 'devastating', 'catastrophic', 'destructive'];
  const fearTerms = ['scared', 'afraid', 'terrifying', 'fear', 'panic', 'worried'];
  
  // Count occurrences of each term type
  const urgencyCount = urgencyTerms.reduce((count, term) => 
    count + (text.toLowerCase().includes(term) ? 1 : 0), 0);
    
  const severityCount = severityTerms.reduce((count, term) => 
    count + (text.toLowerCase().includes(term) ? 1 : 0), 0);
    
  const fearCount = fearTerms.reduce((count, term) => 
    count + (text.toLowerCase().includes(term) ? 1 : 0), 0);
  
  // Calculate scores
  const urgencyScore = Math.min(1, urgencyCount / 3);
  const severityScore = Math.min(1, severityCount / 3);
  const fearScore = Math.min(1, fearCount / 3);
  
  // Calculate reliability (inverse of length - shorter messages might be less reliable)
  // This is just one simple heuristic for demonstration
  const reliabilityScore = Math.min(1, text.length / 100);
  
  return {
    urgency: urgencyScore,
    severity: severityScore,
    fear: fearScore,
    reliability: reliabilityScore
  };
}

/**
 * Generate evacuation priority zones based on disaster data
 * @param disasterLocation The disaster location
 * @param severity The disaster severity (0-1)
 * @param populationData Array of population centers
 * @returns Array of evacuation zones with priorities
 */
export function generateEvacuationZones(
  disasterLocation: { lat: number; lng: number },
  severity: number,
  populationData: Array<{ 
    lat: number; 
    lng: number; 
    population: number;
    infrastructure: 'critical' | 'major' | 'minor';
  }>
): Array<{
  name: string;
  priority: 'critical' | 'warning' | 'info';
  center: { lat: number; lng: number };
  radius: number;
}> {
  // This is a simplified approach for demonstration
  // In a real implementation, this would use more sophisticated algorithms
  
  return populationData.map((location, index) => {
    // Calculate distance from disaster
    const distance = calculateDistance(
      disasterLocation.lat,
      disasterLocation.lng,
      location.lat,
      location.lng
    );
    
    // Calculate priority based on distance, population and infrastructure
    let priority: 'critical' | 'warning' | 'info' = 'info';
    
    if (distance < 10 && (location.population > 5000 || location.infrastructure === 'critical')) {
      priority = 'critical';
    } else if (distance < 20 && (location.population > 1000 || location.infrastructure !== 'minor')) {
      priority = 'warning';
    }
    
    // Adjust based on overall disaster severity
    if (severity > 0.8 && priority === 'warning') {
      priority = 'critical';
    } else if (severity > 0.5 && priority === 'info') {
      priority = 'warning';
    }
    
    return {
      name: `Zone ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
      priority,
      center: { lat: location.lat, lng: location.lng },
      radius: priority === 'critical' ? 5000 : priority === 'warning' ? 3000 : 1500
    };
  });
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
