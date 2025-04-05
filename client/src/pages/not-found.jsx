import { Link } from 'wouter';
import { AlertTriangle, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 text-center">
      <div className="mb-6 p-6 bg-amber-50 rounded-full">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      
      <p className="text-lg text-gray-600 max-w-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
        Please check the URL or navigate back to the dashboard.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-5 w-5" /> Return to Dashboard
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/report">
            <Search className="h-5 w-5" /> Report an Issue
          </Link>
        </Button>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-md">
        <p className="text-sm text-gray-500">
          If you believe this is an error in our system, please report it to our support team.
        </p>
      </div>
    </div>
  );
}