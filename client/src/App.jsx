import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { 
  Home, 
  Map, 
  Bell, 
  FileText, 
  Package, 
  BarChart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  SatelliteDish, 
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Dashboard from '@/pages/Dashboard';
import Resources from '@/pages/Resources';
import Alerts from '@/pages/Alerts';
import Report from '@/pages/Report';
import Predictions from '@/pages/Predictions';
import Analytics from '@/pages/Analytics';
import MapView from '@/pages/MapView';
import NotFound from '@/pages/not-found';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen is mobile on mount and when window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Close sidebar when navigating on mobile
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "w-64 bg-white border-r border-gray-200 flex flex-col",
          isMobile ? "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out" : "",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "",
          isMobile && isSidebarOpen ? "translate-x-0 shadow-xl" : ""
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">DisasterGuard</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Disaster Response</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/" icon={<Home className="h-5 w-5" />} onClick={handleNavigation}>
            Dashboard
          </NavLink>
          <NavLink href="/resources" icon={<Package className="h-5 w-5" />} onClick={handleNavigation}>
            Resources
          </NavLink>
          <NavLink href="/alerts" icon={<Bell className="h-5 w-5" />} onClick={handleNavigation}>
            Alerts
          </NavLink>
          <NavLink href="/report" icon={<FileText className="h-5 w-5" />} onClick={handleNavigation}>
            Report
          </NavLink>
          <NavLink href="/map" icon={<Map className="h-5 w-5" />} onClick={handleNavigation}>
            Map View
          </NavLink>
          <NavLink href="/analytics" icon={<BarChart className="h-5 w-5" />} onClick={handleNavigation}>
            Analytics
          </NavLink>
          <NavLink href="/predict" icon={<SatelliteDish className="h-5 w-5" />} onClick={handleNavigation}>
            Predictions
          </NavLink>
        </nav>
        
        {/* User & Settings */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Emergency Coordinator</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <NavLink href="/settings" icon={<Settings className="h-5 w-5" />} onClick={handleNavigation}>
              Settings
            </NavLink>
            <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 overflow-auto",
        isMobile ? "pl-0" : "pl-0" // Adjust padding as needed when sidebar is visible
      )}>
        {/* Main content routes */}
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/resources" component={Resources} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/report" component={Report} />
          <Route path="/map" component={MapView} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/predict" component={Predictions} />
          <Route path="/settings" component={() => <div className="container mx-auto p-6"><h1 className="text-3xl font-bold mb-4">Settings</h1><p className="text-lg text-gray-600">User settings page is currently under development.</p></div>} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Overlay to close sidebar on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function NavLink({ href, icon, children, onClick }) {
  return (
    <a 
      href={href} 
      className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      {icon}
      {children}
    </a>
  );
}

export default App;