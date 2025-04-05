import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  MapPin, 
  Clock, 
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDate } from '@/lib/utils';

export default function Alerts() {
  const [alertFilter, setAlertFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch alerts data
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/alerts'],
  });
  
  // Filter icons based on severity
  const severityIcons = {
    critical: <AlertTriangle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  
  // Severity badge styling based on level
  const severityStyles = {
    critical: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-orange-100 text-orange-800 border-orange-300",
    info: "bg-blue-100 text-blue-800 border-blue-300"
  };
  
  // Filter alerts based on filter and search query
  const filteredAlerts = alerts.filter(alert => {
    // Filter by status (active/inactive)
    if (alertFilter === 'active' && !alert.active) return false;
    if (alertFilter === 'inactive' && alert.active) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.area.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts Management</h1>
          <p className="text-gray-500 mt-2">
            Monitor and manage critical alerts for affected areas
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Create Alert
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={alertFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlertFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={alertFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlertFilter('active')}
            className="flex items-center gap-1"
          >
            <Bell className="h-4 w-4" /> Active
          </Button>
          <Button 
            variant={alertFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAlertFilter('inactive')}
            className="flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" /> Inactive
          </Button>
        </div>
      </div>
      
      {/* Alerts List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No Alerts Found</h3>
          <p className="text-gray-500 max-w-md mt-2">
            {searchQuery 
              ? `No alerts match "${searchQuery}" with the current filters`
              : 'There are no alerts available with the current filters'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setAlertFilter('all');
            setSearchQuery('');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="border-none">
            {filteredAlerts.map(alert => (
              <AccordionItem key={alert.id} value={`alert-${alert.id}`}>
                <Card className={alert.active ? 'border-l-4 border-l-red-500' : ''}>
                  <CardHeader className="p-4 pb-0">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex flex-col md:flex-row md:items-center w-full justify-between">
                        <div className="flex items-start md:items-center gap-3">
                          <div className="p-2 rounded-full bg-gray-100">
                            {severityIcons[alert.severity] || <Bell className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-left">{alert.title}</CardTitle>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin className="h-3.5 w-3.5 mr-1" /> 
                              {alert.area}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-3 md:mt-0">
                          <Badge className={`mr-3 ${severityStyles[alert.severity] || "bg-gray-100"}`}>
                            {alert.severity}
                          </Badge>
                          <Badge variant={alert.active ? "default" : "outline"}>
                            {alert.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <p className="text-gray-700">{alert.message}</p>
                        
                        {alert.instructions && alert.instructions.items && (
                          <div className="mt-4">
                            <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {alert.instructions.items.map((instruction, idx) => (
                                <li key={idx} className="text-sm">{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 pt-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> 
                            Created: {formatDate(alert.createdAt)}
                          </div>
                          {alert.expiresAt && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" /> 
                              Expires: {formatDate(alert.expiresAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Edit Alert</Button>
                      <Button 
                        variant={alert.active ? "destructive" : "default"} 
                        size="sm"
                      >
                        {alert.active ? "Deactivate Alert" : "Activate Alert"}
                      </Button>
                      <Button variant="outline" size="sm" className="ml-auto">
                        View Affected Area
                      </Button>
                    </CardFooter>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}