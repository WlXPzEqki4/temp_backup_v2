
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileText, ClipboardList, Bot, BarChart, Globe, Database } from 'lucide-react';
import MapTab from '@/components/Dashboard/MapTab';
import WidgetsTab from '@/components/Dashboard/WidgetsTab';
import NewsTab from '@/components/Dashboard/NewsTab';
import AITab from '@/components/Dashboard/AITab';
import ReportsTab from '@/components/Dashboard/ReportsTab';
import AnalyticsTab from '@/components/Dashboard/AnalyticsTab';
import Analytics2Tab from '@/components/Dashboard/Analytics2Tab';

interface DashboardTabsProps {
  permissions: any[];
  hasPermission: (type: 'weather' | 'crypto' | 'rss' | 'news', instance: string) => boolean;
  hasAnyNewsFeed: () => boolean;
  dataFeeds: any[];
  dataFeedsLoading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedClassification: string;
  setSelectedClassification: (value: string) => void;
  selectedReleasability: string;
  setSelectedReleasability: (value: string) => void;
  sortField: any;
  setSortField: (value: any) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc' | ((prev: 'asc' | 'desc') => 'asc' | 'desc')) => void;
  classifications: string[];
  releasability: string[];
  resetFilters: () => void;
  refetchDataFeeds: () => void;
  user: any;
  handleTabChange: (value: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  permissions,
  hasPermission,
  hasAnyNewsFeed,
  dataFeeds,
  dataFeedsLoading,
  searchQuery,
  setSearchQuery,
  selectedClassification,
  setSelectedClassification,
  selectedReleasability,
  setSelectedReleasability,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  classifications,
  releasability,
  resetFilters,
  refetchDataFeeds,
  user,
  handleTabChange
}) => {
  return (
    <Tabs defaultValue="map" className="w-full" onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="map" className="gap-2">
          <Globe className="h-4 w-4" />
          Map
        </TabsTrigger>
        <TabsTrigger value="widgets" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Widgets
        </TabsTrigger>
        <TabsTrigger value="news" className="gap-2">
          <FileText className="h-4 w-4" />
          News
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-2">
          <Bot className="h-4 w-4" />
          AI
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Reports
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2">
          <BarChart className="h-4 w-4" />
          MDM Analytics
        </TabsTrigger>
        <TabsTrigger value="analytics2" className="gap-2">
          <Database className="h-4 w-4" />
          MDM Analytics 2
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="map" className="mt-6">
        <MapTab />
      </TabsContent>
      
      <TabsContent value="widgets" className="mt-6">
        <WidgetsTab 
          permissions={permissions} 
          hasPermission={hasPermission}
          hasAnyNewsFeed={hasAnyNewsFeed}
        />
      </TabsContent>
      
      <TabsContent value="news" className="mt-6">
        <NewsTab 
          permissions={permissions}
          dataFeeds={dataFeeds}
          dataFeedsLoading={dataFeedsLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedClassification={selectedClassification}
          setSelectedClassification={setSelectedClassification}
          selectedReleasability={selectedReleasability}
          setSelectedReleasability={setSelectedReleasability}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          classifications={classifications}
          releasability={releasability}
          resetFilters={resetFilters}
          refetchDataFeeds={refetchDataFeeds}
        />
      </TabsContent>
      
      <TabsContent value="ai" className="mt-6">
        <AITab user={user} />
      </TabsContent>
      
      <TabsContent value="reports" className="mt-6">
        <ReportsTab />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <AnalyticsTab />
      </TabsContent>
      
      <TabsContent value="analytics2" className="mt-6">
        <Analytics2Tab />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
