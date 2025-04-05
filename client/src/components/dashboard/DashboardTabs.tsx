import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, setActiveTab }: DashboardTabsProps) => {
  const tabs: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "prediction", label: "Disaster Prediction" },
    { id: "severity", label: "Severity Analysis" },
    { id: "evacuation", label: "Evacuation Routes" },
    { id: "resources", label: "Resources" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-1 space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "py-3 px-1 font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-neutral-600 hover:text-neutral-800"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTabs;
