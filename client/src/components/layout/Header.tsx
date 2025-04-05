import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-xl font-heading font-bold text-neutral-900">
              DisasterResponse AI
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className={`${location === '/' ? 'text-neutral-900 font-semibold' : 'text-neutral-600'} hover:text-neutral-900 font-medium`}>
                Dashboard
              </a>
            </Link>
            <Link href="/report">
              <a className={`${location === '/report' ? 'text-neutral-900 font-semibold' : 'text-neutral-600'} hover:text-neutral-900 font-medium`}>
                Report Incident
              </a>
            </Link>
            <Link href="/resources">
              <a className={`${location === '/resources' ? 'text-neutral-900 font-semibold' : 'text-neutral-600'} hover:text-neutral-900 font-medium`}>
                Resources
              </a>
            </Link>
            <Link href="/alerts">
              <a className={`${location === '/alerts' ? 'text-neutral-900 font-semibold' : 'text-neutral-600'} hover:text-neutral-900 font-medium`}>
                Alerts
              </a>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
              Live Alerts
            </Button>

            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/">
                    <a 
                      className={`${location === '/' ? 'text-primary font-semibold' : 'text-neutral-600'} hover:text-primary text-lg`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/report">
                    <a 
                      className={`${location === '/report' ? 'text-primary font-semibold' : 'text-neutral-600'} hover:text-primary text-lg`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Report Incident
                    </a>
                  </Link>
                  <Link href="/resources">
                    <a 
                      className={`${location === '/resources' ? 'text-primary font-semibold' : 'text-neutral-600'} hover:text-primary text-lg`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Resources
                    </a>
                  </Link>
                  <Link href="/alerts">
                    <a 
                      className={`${location === '/alerts' ? 'text-primary font-semibold' : 'text-neutral-600'} hover:text-primary text-lg`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Alerts
                    </a>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
