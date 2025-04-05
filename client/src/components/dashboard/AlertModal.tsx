import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { Alert } from "@/lib/types";

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertModal = ({ open, onOpenChange }: AlertModalProps) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data: activeAlerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts/active'],
    enabled: open
  });

  // Set the first critical active alert when alerts are loaded
  useEffect(() => {
    if (activeAlerts && activeAlerts.length > 0) {
      // Find the most critical alert
      const criticalAlert = activeAlerts.find(alert => alert.severity === 'critical') || activeAlerts[0];
      setSelectedAlert(criticalAlert);
    }
  }, [activeAlerts]);

  if (isLoading || !selectedAlert) {
    return null;
  }

  // Parse instructions from JSON if available
  const instructions = selectedAlert.instructions && typeof selectedAlert.instructions === 'object' 
    ? (selectedAlert.instructions as any).items || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-primary px-4 py-3 text-white flex justify-between items-center rounded-t-lg -mx-6 -mt-6">
          <DialogTitle className="font-heading font-bold text-lg">EMERGENCY ALERT</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-primary-dark"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-10 w-10 text-primary mr-3" />
          <div>
            <h4 className="font-medium text-lg">{selectedAlert.title}</h4>
            <p className="text-neutral-600">{selectedAlert.location}</p>
          </div>
        </div>
        
        <p className="text-neutral-700 mb-4">{selectedAlert.description}</p>
        
        {instructions.length > 0 && (
          <div className="bg-neutral-100 p-3 rounded mb-4">
            <div className="font-medium mb-1">Instructions:</div>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              {instructions.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}
        
        <DialogFooter className="flex space-x-3 sm:space-x-3">
          <Button 
            variant="destructive" 
            className="flex-1"
          >
            View Evacuation Map
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 text-primary border-primary"
            onClick={() => onOpenChange(false)}
          >
            Mark as Read
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;
