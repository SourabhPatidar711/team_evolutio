import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Report } from "@/lib/types";
import { Link } from "wouter";

const ReportCard = ({ report }: { report: Report }) => {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div 
        className="h-40 bg-neutral-200" 
        style={{ 
          background: report.imageUrl 
            ? `url('${report.imageUrl}') center center / cover no-repeat` 
            : 'bg-neutral-200' 
        }}
      ></div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium">{report.title}</h4>
          <span 
            className={`inline-block px-2 py-1 ${
              report.status === 'verified' 
                ? 'bg-warning bg-opacity-10 text-warning-dark' 
                : report.reportType === 'assistance' 
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'bg-neutral-200 text-neutral-600'
            } text-xs rounded-full`}
          >
            {report.status === 'verified' 
              ? 'Verified' 
              : report.reportType === 'assistance' 
                ? 'Urgent' 
                : 'Pending'}
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">{report.description}</p>
        <div className="flex justify-between items-center mt-2 text-xs text-neutral-500">
          <span>{report.distance ? `${report.distance} miles from disaster zone` : report.location}</span>
          <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

const CitizenReports = () => {
  const [showReportForm, setShowReportForm] = useState(false);
  
  const { data: reports, isLoading, error } = useQuery<Report[]>({
    queryKey: ['/api/reports/recent'],
  });

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-neutral-200">
        <CardTitle className="font-heading font-semibold text-lg">Crowdsourced Reports</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <p className="text-neutral-600 mb-3">
            Citizens can submit reports with geo-tagged photos and videos. AI verifies these reports for authenticity to prevent misinformation.
          </p>

          <Link href="/report">
            <Button className="inline-flex items-center bg-primary hover:bg-primary-dark mr-3">
              <Camera className="h-4 w-4 mr-2" />
              Submit New Report
            </Button>
          </Link>

          <Button variant="outline" className="inline-flex items-center text-primary border-primary hover:bg-primary-light hover:bg-opacity-5">
            View All Reports
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-neutral-200 rounded-lg overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-neutral-600 mb-3">Failed to load recent reports.</p>
            <Button>Retry</Button>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg border-dashed border-neutral-300 bg-neutral-50">
            <Camera className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">No Reports Yet</h3>
            <p className="text-neutral-600 mb-4">Be the first to submit a report about current conditions in your area.</p>
            <Link href="/report">
              <Button>Submit a Report</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CitizenReports;
