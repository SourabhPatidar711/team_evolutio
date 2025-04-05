import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  BarChart,
  PieChart,
  LineChart,
  Flame,
  Droplets,
  CloudLightning,
  Waves,
  AlertTriangle,
  Info,
  CalendarDays,
  Users,
  Megaphone,
  User,
  Home,
  Landmark,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { formatDate, formatNumber, getSeverityColor } from '@/lib/utils';
import { getDisasterAnalytics } from '@/lib/aiUtils';

export default function Analytics() {
  const [activeTimeRange, setActiveTimeRange] = useState('30d');
  const [selectedDisasterType, setSelectedDisasterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch disaster data
  const { data: disasters = [], isLoading: disastersLoading } = useQuery({
    queryKey: ['/api/disasters'],
  });

  // Fetch reports data
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/reports'],
  });

  // Generate disaster analysis report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      setTimeout(() => {
        setIsGenerating(false);
        // In a real implementation, this would create a PDF or other report format
        alert('Report generated successfully! In a production environment, this would download a PDF.');
      }, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    // In a real implementation, this would invalidate and refetch queries
  };

  // Get disaster counts by type
  const getDisasterCountsByType = () => {
    const counts = {
      fire: 0,
      flood: 0,
      storm: 0,
      earthquake: 0,
      other: 0
    };
    
    disasters.forEach(disaster => {
      if (counts[disaster.type]) {
        counts[disaster.type]++;
      } else {
        counts.other++;
      }
    });
    
    return counts;
  };

  // Get disaster counts by severity
  const getDisasterCountsBySeverity = () => {
    const counts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      monitoring: 0
    };
    
    disasters.forEach(disaster => {
      if (counts[disaster.severity]) {
        counts[disaster.severity]++;
      } else {
        counts.monitoring++;
      }
    });
    
    return counts;
  };

  // Get disaster counts by status
  const getDisasterCountsByStatus = () => {
    const counts = {
      active: 0,
      resolved: 0,
      monitoring: 0
    };
    
    disasters.forEach(disaster => {
      if (disaster.status === 'active') {
        counts.active++;
      } else if (disaster.status === 'resolved') {
        counts.resolved++;
      } else {
        counts.monitoring++;
      }
    });
    
    return counts;
  };

  // Get report counts by status
  const getReportCountsByStatus = () => {
    const counts = {
      verified: 0,
      unverified: 0,
      rejected: 0
    };
    
    reports.forEach(report => {
      if (counts[report.status]) {
        counts[report.status]++;
      }
    });
    
    return counts;
  };

  // Get report counts by source
  const getReportCountsBySource = () => {
    const counts = {
      citizen: 0,
      responder: 0,
      agency: 0,
      media: 0,
      other: 0
    };
    
    reports.forEach(report => {
      if (counts[report.source]) {
        counts[report.source]++;
      } else {
        counts.other++;
      }
    });
    
    return counts;
  };

  // Calculate percentage change
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get trend direction and color
  const getTrendInfo = (percentChange, isPositiveGood = false) => {
    if (percentChange === 0) {
      return { icon: null, color: 'text-gray-500' };
    }
    
    const isPositive = percentChange > 0;
    const isGood = isPositiveGood ? isPositive : !isPositive;
    
    return {
      icon: isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />,
      color: isGood ? 'text-emerald-600' : 'text-red-600'
    };
  };

  // Summary statistics
  const stats = {
    totalDisasters: disasters.length,
    activeDisasters: disasters.filter(d => d.status === 'active').length,
    totalReports: reports.length,
    averageResolutionTime: '72 hours', // This would be calculated in a real application
    verifiedReports: reports.filter(r => r.status === 'verified').length,
    criticalDisasters: disasters.filter(d => d.severity === 'critical').length,
    totalAffectedArea: disasters.reduce((sum, d) => sum + (d.affectedArea || 0), 0),
    // Previous period stats (for trend calculation)
    previousStats: {
      totalDisasters: 12,
      activeDisasters: 5,
      totalReports: 83,
      verifiedReports: 67,
      criticalDisasters: 2,
      totalAffectedArea: 145
    }
  };

  // Trend calculations
  const trends = {
    totalDisasters: calculatePercentChange(stats.totalDisasters, stats.previousStats.totalDisasters),
    activeDisasters: calculatePercentChange(stats.activeDisasters, stats.previousStats.activeDisasters),
    totalReports: calculatePercentChange(stats.totalReports, stats.previousStats.totalReports),
    verifiedReports: calculatePercentChange(stats.verifiedReports, stats.previousStats.verifiedReports),
    criticalDisasters: calculatePercentChange(stats.criticalDisasters, stats.previousStats.criticalDisasters),
    totalAffectedArea: calculatePercentChange(stats.totalAffectedArea, stats.previousStats.totalAffectedArea)
  };

  // Format trend display
  const formatTrend = (percentChange) => {
    return `${percentChange > 0 ? '+' : ''}${Math.round(percentChange)}%`;
  };

  // Mock time series data for charts
  const timeSeriesData = {
    disasters: [4, 5, 7, 8, 10, 12, 15, 17, 18, 16, 15, 14],
    reports: [28, 42, 50, 65, 75, 90, 83, 78, 95, 110, 117, 122],
    responseTime: [96, 88, 82, 78, 74, 72, 68, 66, 70, 72, 74, 72]
  };

  // Get icon for disaster type
  const getDisasterIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'flood':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'earthquake':
        return <Waves className="h-5 w-5 text-orange-500" />;
      case 'storm':
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disaster Analytics</h1>
          <p className="text-gray-500 mt-2">
            Comprehensive analysis and insights on disaster data
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Time Range</p>
            <div className="flex space-x-1 rounded-md bg-muted p-1">
              <Button 
                variant={activeTimeRange === '7d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTimeRange('7d')}
                className={activeTimeRange === '7d' ? 'bg-primary text-white' : ''}
              >
                7 Days
              </Button>
              <Button 
                variant={activeTimeRange === '30d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTimeRange('30d')}
                className={activeTimeRange === '30d' ? 'bg-primary text-white' : ''}
              >
                30 Days
              </Button>
              <Button 
                variant={activeTimeRange === '90d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTimeRange('90d')}
                className={activeTimeRange === '90d' ? 'bg-primary text-white' : ''}
              >
                90 Days
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Disaster Type</p>
            <Select 
              value={selectedDisasterType} 
              onValueChange={setSelectedDisasterType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fire">Wildfire</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="earthquake">Earthquake</SelectItem>
                <SelectItem value="storm">Storm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Last updated:</span> {formatDate(new Date(), { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Total Disasters"
          value={stats.totalDisasters}
          trend={formatTrend(trends.totalDisasters)}
          trendInfo={getTrendInfo(trends.totalDisasters, false)}
          subtitle={`${stats.activeDisasters} currently active`}
        />
        <StatCard 
          icon={<Megaphone className="h-5 w-5" />}
          title="Total Reports"
          value={stats.totalReports}
          trend={formatTrend(trends.totalReports)}
          trendInfo={getTrendInfo(trends.totalReports, true)}
          subtitle={`${stats.verifiedReports} verified reports`}
        />
        <StatCard 
          icon={<Flame className="h-5 w-5" />}
          title="Critical Incidents"
          value={stats.criticalDisasters}
          trend={formatTrend(trends.criticalDisasters)}
          trendInfo={getTrendInfo(trends.criticalDisasters, false)}
          subtitle="Highest severity level"
        />
        <StatCard 
          icon={<Landmark className="h-5 w-5" />}
          title="Affected Area"
          value={`${formatNumber(stats.totalAffectedArea)} km²`}
          trend={formatTrend(trends.totalAffectedArea)}
          trendInfo={getTrendInfo(trends.totalAffectedArea, false)}
          subtitle="Total geographic impact"
        />
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Report Analysis</TabsTrigger>
          <TabsTrigger value="resources">Resource Impact</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Disaster Distribution by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disaster Distribution by Type</CardTitle>
                <CardDescription>Breakdown of recorded disasters by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <PieChartPlaceholder />
                </div>
                {!disastersLoading && (
                  <div className="space-y-3">
                    <DistributionItem 
                      icon={<Flame className="h-4 w-4 text-red-500" />}
                      label="Wildfires"
                      count={getDisasterCountsByType().fire}
                      percentage={Math.round((getDisasterCountsByType().fire / stats.totalDisasters) * 100) || 0}
                      color="bg-red-500"
                    />
                    <DistributionItem 
                      icon={<Droplets className="h-4 w-4 text-blue-500" />}
                      label="Floods"
                      count={getDisasterCountsByType().flood}
                      percentage={Math.round((getDisasterCountsByType().flood / stats.totalDisasters) * 100) || 0}
                      color="bg-blue-500"
                    />
                    <DistributionItem 
                      icon={<CloudLightning className="h-4 w-4 text-purple-500" />}
                      label="Storms"
                      count={getDisasterCountsByType().storm}
                      percentage={Math.round((getDisasterCountsByType().storm / stats.totalDisasters) * 100) || 0}
                      color="bg-purple-500"
                    />
                    <DistributionItem 
                      icon={<Waves className="h-4 w-4 text-orange-500" />}
                      label="Earthquakes"
                      count={getDisasterCountsByType().earthquake}
                      percentage={Math.round((getDisasterCountsByType().earthquake / stats.totalDisasters) * 100) || 0}
                      color="bg-orange-500"
                    />
                    <DistributionItem 
                      icon={<AlertTriangle className="h-4 w-4 text-gray-500" />}
                      label="Other"
                      count={getDisasterCountsByType().other}
                      percentage={Math.round((getDisasterCountsByType().other / stats.totalDisasters) * 100) || 0}
                      color="bg-gray-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Disaster Severity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Severity Analysis</CardTitle>
                <CardDescription>Distribution of disasters by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <BarChartPlaceholder />
                </div>
                {!disastersLoading && (
                  <div className="space-y-3">
                    <DistributionItem 
                      label="Critical"
                      count={getDisasterCountsBySeverity().critical}
                      percentage={Math.round((getDisasterCountsBySeverity().critical / stats.totalDisasters) * 100) || 0}
                      color="bg-red-600"
                    />
                    <DistributionItem 
                      label="High"
                      count={getDisasterCountsBySeverity().high}
                      percentage={Math.round((getDisasterCountsBySeverity().high / stats.totalDisasters) * 100) || 0}
                      color="bg-orange-500"
                    />
                    <DistributionItem 
                      label="Moderate"
                      count={getDisasterCountsBySeverity().moderate}
                      percentage={Math.round((getDisasterCountsBySeverity().moderate / stats.totalDisasters) * 100) || 0}
                      color="bg-yellow-500"
                    />
                    <DistributionItem 
                      label="Low"
                      count={getDisasterCountsBySeverity().low}
                      percentage={Math.round((getDisasterCountsBySeverity().low / stats.totalDisasters) * 100) || 0}
                      color="bg-green-500"
                    />
                    <DistributionItem 
                      label="Monitoring"
                      count={getDisasterCountsBySeverity().monitoring}
                      percentage={Math.round((getDisasterCountsBySeverity().monitoring / stats.totalDisasters) * 100) || 0}
                      color="bg-blue-400"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* AI Insights */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">AI Generated Insights</CardTitle>
                  <Badge variant="secondary">AI Analysis</Badge>
                </div>
                <CardDescription>Key insights derived from disaster data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-blue-100 bg-blue-50 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 text-sm">Pattern Recognition</h4>
                        <p className="text-sm text-blue-700">
                          Increased wildfire frequency correlates with 45% rise in average temperatures in affected regions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-amber-100 bg-amber-50 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-800 text-sm">Risk Assessment</h4>
                        <p className="text-sm text-amber-700">
                          Coastal areas show 68% higher vulnerability to compound disasters (storms + flooding) than previous years.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-emerald-100 bg-emerald-50 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-emerald-800 text-sm">Response Optimization</h4>
                        <p className="text-sm text-emerald-700">
                          Preemptive evacuation orders have reduced casualty rates by 83% in high-severity disaster zones.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-purple-100 bg-purple-50 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <BarChart className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-purple-800 text-sm">Forecasting</h4>
                        <p className="text-sm text-purple-700">
                          Predictive models indicate 72% probability of increased storm activity in Gulf regions over next 60 days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">Generate Custom Insights</Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recent Disasters Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Disasters</CardTitle>
              <CardDescription>Latest disaster events and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {disastersLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Loading disaster data...</p>
                </div>
              ) : disasters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No disaster data available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Severity</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Started</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Area Affected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disasters.slice(0, 5).map((disaster) => (
                        <tr key={disaster.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">{disaster.name}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getDisasterIcon(disaster.type)}
                              <span className="capitalize">{disaster.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{disaster.location}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                              className="text-white"
                            >
                              {disaster.severity}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={disaster.status === 'active' ? 'destructive' : disaster.status === 'resolved' ? 'outline' : 'secondary'}>
                              {disaster.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatDate(disaster.startedAt, { dateStyle: 'medium' })}</td>
                          <td className="py-3 px-4">{disaster.affectedArea ? `${disaster.affectedArea} km²` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing 5 of {disasters.length} disasters
              </p>
              <Button variant="ghost" size="sm">View All</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disaster Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Disaster Frequency Trend</CardTitle>
                <CardDescription>Number of disasters over time with future projections</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <LineChartPlaceholder height={300} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Data shows a 23% increase in disaster frequency over the selected period
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-xs">Actual</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                      <span className="text-xs">Projected</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Response Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time Analysis</CardTitle>
                <CardDescription>Average emergency response times (hours)</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <LineChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Response times improved by 25% in the past month due to optimized resource allocation
                </p>
              </CardFooter>
            </Card>
            
            {/* Severity Distribution Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Severity Distribution Over Time</CardTitle>
                <CardDescription>How disaster severity levels have changed</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <StackedBarChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  The proportion of critical and high severity incidents has increased by 15%
                </p>
              </CardFooter>
            </Card>
            
            {/* Forecast & Predictions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">AI-Powered Forecasting</CardTitle>
                  <Badge variant="secondary">AI Analysis</Badge>
                </div>
                <CardDescription>Predictive analysis for disaster risk in coming months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ForecastCard 
                    title="Wildfire Risk"
                    icon={<Flame className="h-10 w-10 text-red-500" />}
                    probability={78}
                    trend="+15%"
                    trendDirection="up"
                    regions={["Northern California", "Southern Oregon", "Arizona"]}
                    timeframe="Next 30 days"
                  />
                  <ForecastCard 
                    title="Flood Risk"
                    icon={<Droplets className="h-10 w-10 text-blue-500" />}
                    probability={64}
                    trend="+8%"
                    trendDirection="up"
                    regions={["Gulf Coast", "Mississippi River Basin", "Central Florida"]}
                    timeframe="Next 60 days"
                  />
                  <ForecastCard 
                    title="Storm Risk"
                    icon={<CloudLightning className="h-10 w-10 text-purple-500" />}
                    probability={85}
                    trend="+23%"
                    trendDirection="up"
                    regions={["Atlantic Coast", "Gulf of Mexico", "Caribbean Islands"]}
                    timeframe="Next 90 days"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Forecasts are based on AI analysis of historical data, climate models, and current conditions
                </p>
                <Button variant="outline" size="sm">View Detailed Forecast</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Volume Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Report Volume Over Time</CardTitle>
                <CardDescription>Number of reports submitted per week</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <LineChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Report volume increased by 34% following improved mobile reporting system deployment
                </p>
              </CardFooter>
            </Card>
            
            {/* Report Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Status Breakdown</CardTitle>
                <CardDescription>Distribution of report verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <PieChartPlaceholder />
                </div>
                {!reportsLoading && (
                  <div className="space-y-3">
                    <DistributionItem 
                      label="Verified"
                      count={getReportCountsByStatus().verified}
                      percentage={Math.round((getReportCountsByStatus().verified / stats.totalReports) * 100) || 0}
                      color="bg-emerald-500"
                    />
                    <DistributionItem 
                      label="Unverified"
                      count={getReportCountsByStatus().unverified}
                      percentage={Math.round((getReportCountsByStatus().unverified / stats.totalReports) * 100) || 0}
                      color="bg-amber-500"
                    />
                    <DistributionItem 
                      label="Rejected"
                      count={getReportCountsByStatus().rejected}
                      percentage={Math.round((getReportCountsByStatus().rejected / stats.totalReports) * 100) || 0}
                      color="bg-red-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Report Source Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Source Analysis</CardTitle>
                <CardDescription>Reports by contributor type</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <BarChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Citizen reports account for 68% of all verified incident data
                </p>
              </CardFooter>
            </Card>
            
            {/* Report Accuracy Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Report Accuracy Analysis</CardTitle>
                <CardDescription>Verification rate by source and disaster type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">Source</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Total Reports</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Verified</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Verification Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Most Reported Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Citizens</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">76</td>
                        <td className="py-3 px-4">52</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={68} className="h-2 w-20" />
                            <span>68%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span>Wildfire</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>First Responders</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">35</td>
                        <td className="py-3 px-4">33</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={94} className="h-2 w-20" />
                            <span>94%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span>Flood</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4" />
                            <span>Government Agencies</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">22</td>
                        <td className="py-3 px-4">22</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={100} className="h-2 w-20" />
                            <span>100%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CloudLightning className="h-4 w-4 text-purple-500" />
                            <span>Storm</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4" />
                            <span>Media Reports</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">18</td>
                        <td className="py-3 px-4">14</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={78} className="h-2 w-20" />
                            <span>78%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Waves className="h-4 w-4 text-orange-500" />
                            <span>Earthquake</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Resource Impact Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Allocation */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Resource Allocation by Disaster Type</CardTitle>
                <CardDescription>Distribution of resources across different disaster categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <StackedBarChartPlaceholder height={300} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Wildfires account for 42% of all emergency resource deployment over the past 30 days
                </p>
              </CardFooter>
            </Card>
            
            {/* Resource Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Deployment Efficiency</CardTitle>
                <CardDescription>Time from allocation to deployment (hours)</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <LineChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Average deployment time decreased by 35% through improved logistics and coordination
                </p>
              </CardFooter>
            </Card>
            
            {/* Resource Impact Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Impact Analysis</CardTitle>
                <CardDescription>Effectiveness metrics by resource type</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <BarChartPlaceholder height={240} />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Medical teams show highest impact rating (87%) based on lives saved per unit deployed
                </p>
              </CardFooter>
            </Card>
            
            {/* AI Resource Optimization */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">AI Resource Optimization</CardTitle>
                  <Badge variant="secondary">AI Analysis</Badge>
                </div>
                <CardDescription>AI-generated recommendations for optimal resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-500" />
                      <span>Wildfire Response Optimization</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Analysis indicates potential for 23% improvement in response effectiveness through reallocation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/20 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Current Distribution</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Firefighting Teams</span>
                            <span className="font-medium">12 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Aircraft Support</span>
                            <span className="font-medium">3 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Ground Equipment</span>
                            <span className="font-medium">8 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Medical Support</span>
                            <span className="font-medium">5 units</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md border border-green-100">
                        <h4 className="text-sm font-medium mb-2 text-green-800">Recommended Distribution</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Firefighting Teams</span>
                            <span className="font-medium">10 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Aircraft Support</span>
                            <span className="font-medium">5 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Ground Equipment</span>
                            <span className="font-medium">10 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Medical Support</span>
                            <span className="font-medium">3 units</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <span>Flood Response Optimization</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Predictive modeling suggests preemptive staging of resources in coastal areas with 76% confidence.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/20 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Current Distribution</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Rescue Teams</span>
                            <span className="font-medium">7 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Boats/Watercraft</span>
                            <span className="font-medium">4 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Evacuation Transport</span>
                            <span className="font-medium">6 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Emergency Supplies</span>
                            <span className="font-medium">8 units</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md border border-green-100">
                        <h4 className="text-sm font-medium mb-2 text-green-800">Recommended Distribution</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Rescue Teams</span>
                            <span className="font-medium">9 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Boats/Watercraft</span>
                            <span className="font-medium">8 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Evacuation Transport</span>
                            <span className="font-medium">5 units</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Emergency Supplies</span>
                            <span className="font-medium">6 units</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">Apply AI Recommendations</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for statistics card
function StatCard({ icon, title, value, trend, trendInfo, subtitle }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-muted rounded-md">
            {icon}
          </div>
          {trend && (
            <Badge variant="outline" className={`flex items-center gap-1 ${trendInfo.color}`}>
              {trendInfo.icon}
              {trend}
            </Badge>
          )}
        </div>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for distribution item with progress bar
function DistributionItem({ icon, label, count, percentage, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium">{count}</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={percentage} className={`h-2 flex-1 ${color}`} />
        <span className="text-xs font-medium">{percentage}%</span>
      </div>
    </div>
  );
}

// Component for forecast card
function ForecastCard({ title, icon, probability, trend, trendDirection, regions, timeframe }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        {icon}
        <Badge variant="outline" className={`flex items-center gap-1 ${trendDirection === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
          {trendDirection === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {trend}
        </Badge>
      </div>
      
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Probability</span>
          <span className="text-sm font-medium">{probability}%</span>
        </div>
        <Progress value={probability} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-500">High Risk Regions</h4>
          <ul className="mt-1">
            {regions.map((region, index) => (
              <li key={index} className="text-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {region}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-500">Timeframe</h4>
          <p className="text-sm flex items-center gap-1 mt-1">
            <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
            {timeframe}
          </p>
        </div>
      </div>
    </div>
  );
}

// Placeholder chart components
function PieChartPlaceholder() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="80" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M90,10 A80,80 0 0,1 160,90 L90,90 Z" fill="#ef4444" />
      <path d="M90,90 L160,90 A80,80 0 0,1 117,162 Z" fill="#3b82f6" />
      <path d="M90,90 L117,162 A80,80 0 0,1 25,130 Z" fill="#8b5cf6" />
      <path d="M90,90 L25,130 A80,80 0 0,1 90,10 Z" fill="#f97316" />
      <circle cx="90" cy="90" r="40" fill="white" />
    </svg>
  );
}

function BarChartPlaceholder({ height = 180 }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} preserveAspectRatio="none">
      <rect x="25" y="20" width="50" height="160" rx="4" fill="#ef4444" opacity="0.8" />
      <rect x="125" y="60" width="50" height="120" rx="4" fill="#3b82f6" opacity="0.8" />
      <rect x="225" y="85" width="50" height="95" rx="4" fill="#8b5cf6" opacity="0.8" />
      <rect x="325" y="105" width="50" height="75" rx="4" fill="#f97316" opacity="0.8" />
      <line x1="0" y1="180" x2="400" y2="180" stroke="#e2e8f0" strokeWidth="2" />
    </svg>
  );
}

function LineChartPlaceholder({ height = 180 }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} preserveAspectRatio="none">
      <polyline 
        points="0,150 40,140 80,120 120,100 160,80 200,70 240,55 280,65 320,50 360,40 400,30" 
        fill="none" 
        stroke="hsl(var(--primary))" 
        strokeWidth="3"
      />
      <polyline 
        points="0,150 40,140 80,120 120,100 160,80 200,70 240,55 280,65 320,50 360,40 400,30" 
        fill="url(#gradient)" 
        strokeWidth="0"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={height} x2="400" y2={height} stroke="#e2e8f0" strokeWidth="2" />
    </svg>
  );
}

function StackedBarChartPlaceholder({ height = 180 }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} preserveAspectRatio="none">
      <g transform="translate(25, 0)">
        <rect x="0" y="20" width="50" height="40" rx="4" fill="#ef4444" opacity="0.8" />
        <rect x="0" y="60" width="50" height="30" rx="4" fill="#3b82f6" opacity="0.8" />
        <rect x="0" y="90" width="50" height="50" rx="4" fill="#8b5cf6" opacity="0.8" />
        <rect x="0" y="140" width="50" height="20" rx="4" fill="#f97316" opacity="0.8" />
      </g>
      <g transform="translate(125, 0)">
        <rect x="0" y="30" width="50" height="50" rx="4" fill="#ef4444" opacity="0.8" />
        <rect x="0" y="80" width="50" height="40" rx="4" fill="#3b82f6" opacity="0.8" />
        <rect x="0" y="120" width="50" height="30" rx="4" fill="#8b5cf6" opacity="0.8" />
        <rect x="0" y="150" width="50" height="10" rx="4" fill="#f97316" opacity="0.8" />
      </g>
      <g transform="translate(225, 0)">
        <rect x="0" y="50" width="50" height="60" rx="4" fill="#ef4444" opacity="0.8" />
        <rect x="0" y="110" width="50" height="20" rx="4" fill="#3b82f6" opacity="0.8" />
        <rect x="0" y="130" width="50" height="20" rx="4" fill="#8b5cf6" opacity="0.8" />
        <rect x="0" y="150" width="50" height="10" rx="4" fill="#f97316" opacity="0.8" />
      </g>
      <g transform="translate(325, 0)">
        <rect x="0" y="40" width="50" height="30" rx="4" fill="#ef4444" opacity="0.8" />
        <rect x="0" y="70" width="50" height="50" rx="4" fill="#3b82f6" opacity="0.8" />
        <rect x="0" y="120" width="50" height="30" rx="4" fill="#8b5cf6" opacity="0.8" />
        <rect x="0" y="150" width="50" height="20" rx="4" fill="#f97316" opacity="0.8" />
      </g>
      <line x1="0" y1="180" x2="400" y2="180" stroke="#e2e8f0" strokeWidth="2" />
    </svg>
  );
}