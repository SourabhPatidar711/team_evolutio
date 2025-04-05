import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReportSchema } from "@shared/schema";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Camera, MapPin, AlertTriangle, Check } from "lucide-react";
import Map from "@/components/ui/map";
import { useQuery } from "@tanstack/react-query";
import { Disaster } from "@/lib/types";

// Extend the insert schema with additional validation
const reportFormSchema = insertReportSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  reportType: z.enum(["fire", "flood", "road blockage", "damage", "assistance", "other"], {
    required_error: "Please select a report type",
  }),
  latitude: z.number({
    required_error: "Please provide your location",
  }),
  longitude: z.number({
    required_error: "Please provide your location",
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const Report = () => {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState<"idle" | "success" | "error">("idle");

  // Get active disasters to associate the report with
  const { data: activeDisasters } = useQuery<Disaster[]>({
    queryKey: ['/api/disasters/active'],
  });

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      reportType: "fire",
      imageUrl: "https://images.unsplash.com/photo-1507529175354-e2da376eca4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" // Default placeholder image
    },
  });

  // Get geolocation when component mounts
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          form.setValue("latitude", latitude);
          form.setValue("longitude", longitude);
          
          // Get location name from coordinates (reverse geocoding)
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                form.setValue("location", data.results[0].formatted_address);
              }
            })
            .catch(error => console.error("Error fetching location name:", error));
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enter it manually.",
            variant: "destructive",
          });
        }
      );
    }
  });

  const reportMutation = useMutation({
    mutationFn: (values: ReportFormValues) => {
      // Find the closest disaster to associate the report with
      if (activeDisasters && activeDisasters.length > 0 && selectedLocation) {
        const closestDisaster = activeDisasters.reduce((closest, current) => {
          const currentDistance = calculateDistance(
            selectedLocation.lat,
            selectedLocation.lng,
            current.latitude,
            current.longitude
          );
          
          const closestDistance = calculateDistance(
            selectedLocation.lat,
            selectedLocation.lng,
            closest.latitude,
            closest.longitude
          );
          
          return currentDistance < closestDistance ? current : closest;
        });
        
        values.disasterId = closestDisaster.id;
        
        // Calculate distance from disaster
        values.distance = calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          closestDisaster.latitude,
          closestDisaster.longitude
        );
      }
      
      return apiRequest("POST", "/api/reports", values);
    },
    onSuccess: () => {
      setSubmittingStatus("success");
      queryClient.invalidateQueries({ queryKey: ['/api/reports/recent'] });
      
      // Reset form after 3 seconds of showing success
      setTimeout(() => {
        form.reset();
        setSubmittingStatus("idle");
      }, 3000);
    },
    onError: (error) => {
      setSubmittingStatus("error");
      toast({
        title: "Error submitting report",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ReportFormValues) {
    reportMutation.mutate(values);
  }

  // Helper function to calculate distance between two coordinates (in miles)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
      
      // Get location name from coordinates (reverse geocoding)
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results[0]) {
            form.setValue("location", data.results[0].formatted_address);
          }
        })
        .catch(error => console.error("Error fetching location name:", error));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">Report an Incident</h1>
        <p className="text-neutral-600">
          Submit a report about current conditions in your area. Your reports help emergency services respond effectively.
        </p>
      </div>

      {submittingStatus === "success" ? (
        <Card className="bg-success/10 border-success/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="rounded-full bg-success/20 p-3 mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Report Submitted Successfully!</h2>
              <p className="text-neutral-600 mb-4">
                Thank you for your contribution. Your report will be verified by our AI system and made available to emergency services.
              </p>
              <Button onClick={() => setSubmittingStatus("idle")}>Submit Another Report</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>
                  Provide details about what you're seeing. Be as specific as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fallen tree blocking road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the situation in detail..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Report</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the type of incident" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fire">Fire</SelectItem>
                          <SelectItem value="flood">Flood</SelectItem>
                          <SelectItem value="road blockage">Road Blockage</SelectItem>
                          <SelectItem value="damage">Structural Damage</SelectItem>
                          <SelectItem value="assistance">Need Assistance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Provide the location of the incident. Click on the map to mark the exact spot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address or Location Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123 Main St or Near Central Park" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be automatically filled if you select a location on the map
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                  {selectedLocation ? (
                    <Map 
                      center={selectedLocation} 
                      zoom={14}
                      markers={[
                        {
                          id: 1,
                          position: selectedLocation,
                          title: "Selected Location"
                        }
                      ]}
                      onMapLoad={(map) => {
                        map.addListener("click", handleMapClick);
                      }}
                      height="h-[300px]"
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-600">Getting your location...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <input type="hidden" {...form.register("latitude", { valueAsNumber: true })} />
                <input type="hidden" {...form.register("longitude", { valueAsNumber: true })} />
                
                {!selectedLocation && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Location Required</AlertTitle>
                    <AlertDescription>
                      Please enable location services or select a location on the map.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photo Evidence</CardTitle>
                <CardDescription>
                  Upload a photo of the incident to help emergency services assess the situation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                        <Camera className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-600 mb-2">Drag and drop an image here, or click to upload</p>
                        <p className="text-neutral-500 text-sm mb-4">PNG, JPG or JPEG (max. 5MB)</p>
                        <Button type="button" variant="outline" size="sm">
                          Choose File
                        </Button>
                        <input type="hidden" {...field} />
                      </div>
                      <FormDescription>
                        Your image will be analyzed by AI to verify the report.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full max-w-md"
                disabled={reportMutation.isPending || !selectedLocation}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>

            <Separator />

            <div className="text-center text-neutral-500 text-sm">
              <p>
                All reports are verified by our AI system for authenticity and to prevent misinformation.
                Your personal information will be kept confidential.
              </p>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default Report;
