import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Truck, 
  Stethoscope, 
  LifeBuoy, 
  ShieldAlert, 
  PlusCircle,
  Filter,
  Search,
  SlidersHorizontal, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { optimizeResourceAllocation } from '@/lib/aiUtils';

export default function Resources() {
  const [resourceFilter, setResourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  
  // Fetch resources data
  const { data: resources = [], isLoading: resourcesLoading, refetch } = useQuery({
    queryKey: ['/api/resources'],
  });
  
  // Fetch disasters to display options
  const { data: activeDisasters = [] } = useQuery({
    queryKey: ['/api/disasters/active'],
  });
  
  const getResourceIcon = (type) => {
    switch (type) {
      case 'medical':
        return <Stethoscope className="h-5 w-5 text-red-500" />;
      case 'evacuation':
        return <LifeBuoy className="h-5 w-5 text-blue-500" />;
      case 'fire':
        return <ShieldAlert className="h-5 w-5 text-orange-500" />;
      default:
        return <Truck className="h-5 w-5 text-purple-500" />;
    }
  };
  
  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-300',
    deployed: 'bg-blue-100 text-blue-800 border-blue-300',
    'en-route': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    depleted: 'bg-red-100 text-red-800 border-red-300'
  };
  
  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesFilter = resourceFilter === 'all' || resource.type === resourceFilter;
    
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  const handleOptimizeResources = async () => {
    setOptimizing(true);
    try {
      const result = await optimizeResourceAllocation({
        disasters: activeDisasters,
        currentResources: resources
      });
      
      console.log('Optimization result:', result);
      // In a real app, you'd update the resources based on the optimization result
      setTimeout(() => {
        refetch();
        setOptimizing(false);
      }, 2000);
    } catch (error) {
      console.error('Error optimizing resources:', error);
      setOptimizing(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-500 mt-2">
            Track and manage all available resources for disaster response
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" size="sm" 
            onClick={handleOptimizeResources}
            disabled={optimizing}
            className="flex items-center gap-1"
          >
            {optimizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            {optimizing ? 'Optimizing...' : 'AI Optimize'}
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Resource
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={resourceFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setResourceFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={resourceFilter === 'medical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setResourceFilter('medical')}
            className="flex items-center gap-1"
          >
            <Stethoscope className="h-4 w-4" /> Medical
          </Button>
          <Button 
            variant={resourceFilter === 'fire' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setResourceFilter('fire')}
            className="flex items-center gap-1"
          >
            <ShieldAlert className="h-4 w-4" /> Fire
          </Button>
          <Button 
            variant={resourceFilter === 'evacuation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setResourceFilter('evacuation')}
            className="flex items-center gap-1"
          >
            <LifeBuoy className="h-4 w-4" /> Evacuation
          </Button>
        </div>
      </div>
      
      {/* Resource Cards */}
      {resourcesLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Truck className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No Resources Found</h3>
          <p className="text-gray-500 max-w-md mt-2">
            {searchQuery 
              ? `No resources match "${searchQuery}" with the current filters`
              : 'There are no resources available with the current filters'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setResourceFilter('all');
            setSearchQuery('');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-gray-100">
                      {getResourceIcon(resource.type)}
                    </div>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                  </div>
                  <Badge className={statusColors[resource.status] || 'bg-gray-100'}>
                    {resource.status}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  Location: {resource.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <div className="flex items-center">
                      <span className="text-lg font-medium">{resource.quantity}</span>
                      <span className="text-sm text-gray-500 ml-2">units</span>
                    </div>
                  </div>
                  
                  {resource.disasterId && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned to</p>
                      <p className="text-sm font-medium">
                        {activeDisasters.find(d => d.id === resource.disasterId)?.name || 'Unknown disaster'}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm">{formatDate(resource.updatedAt || resource.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t flex justify-between">
                <Button variant="outline" size="sm">View Details</Button>
                <Button size="sm">Update Status</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}