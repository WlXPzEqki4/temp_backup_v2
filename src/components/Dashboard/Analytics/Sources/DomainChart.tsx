
import React, { useState, useEffect, useMemo } from 'react';
import BarChart from '../../Charts/BarChart';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import WorkspaceSelector from '../WorkspaceSelector';

interface DomainChartProps {
  allDomains: any[];
  workspaces: string[];
}

const DomainChart: React.FC<DomainChartProps> = ({ 
  allDomains, 
  workspaces 
}) => {
  const [domainsWorkspace, setDomainsWorkspace] = useState<string | 'all'>("all");
  const [domainsLoading, setDomainsLoading] = useState<boolean>(false);
  
  // Debug information
  useEffect(() => {
    console.log('All domains data:', allDomains);
    console.log('Available workspaces:', workspaces);
    console.log('Selected domains workspace:', domainsWorkspace);
  }, [allDomains, workspaces, domainsWorkspace]);
  
  // Add loading state when workspace changes
  useEffect(() => {
    setDomainsLoading(true);
    const timer = setTimeout(() => setDomainsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [domainsWorkspace]);
  
  // Filter data based on selected workspaces using useMemo for optimization
  const filteredDomains = useMemo(() => {
    if (domainsWorkspace === 'all') {
      return allDomains;
    }
    
    // Use case-insensitive comparison for workspace filtering
    const filtered = allDomains.filter(item => {
      const itemWorkspace = item.Workspace?.toString().trim() || "";
      const selectedWorkspace = domainsWorkspace?.toString().trim() || "";
      
      const isMatch = itemWorkspace.toLowerCase() === selectedWorkspace.toLowerCase();
      
      // Debug each item check
      console.log(`Domain item check - Item workspace: "${itemWorkspace}", Selected: "${selectedWorkspace}", Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Filtered domains: Found ${filtered.length} items for workspace "${domainsWorkspace}"`);
    return filtered;
  }, [allDomains, domainsWorkspace]);
  
  // Sort and prepare data for display
  const domainsToDisplay = useMemo(() => {
    if (domainsLoading) {
      return [{ Domain: "Loading...", Mentions: 0 }];
    }
    
    if (filteredDomains && filteredDomains.length > 0) {
      // Sort by Mentions in descending order and take top 10
      return [...filteredDomains]
        .sort((a, b) => (b.Mentions || 0) - (a.Mentions || 0))
        .slice(0, 10)
        .map(item => ({
          ...item,
          // Truncate long domain names for better display
          Domain: item.Domain?.length > 30 ? `${item.Domain.substring(0, 27)}...` : item.Domain
        }));
    }
    
    return [{ Domain: "No data available", Mentions: 0 }];
  }, [filteredDomains, domainsLoading]);
  
  // Check if we have actual data
  const hasDomainData = !domainsLoading && filteredDomains && filteredDomains.length > 0;

  return (
    <Card className={`shadow-sm ${!hasDomainData ? "border-yellow-200" : ""}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Top Domains</h3>
        <WorkspaceSelector
          selectedWorkspace={domainsWorkspace}
          setSelectedWorkspace={setDomainsWorkspace}
          workspaces={workspaces}
          className="ml-auto"
        />
      </CardHeader>
      <CardContent className="p-4 flex flex-col">
        {!hasDomainData && (
          <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-50 text-yellow-800 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">
              No domain data available for "{domainsWorkspace}" workspace 
              ({filteredDomains.length} domains found in all workspaces)
            </span>
          </div>
        )}
        <div className="w-full h-[450px]"> 
          <BarChart 
            data={domainsToDisplay}
            xDataKey="Domain"
            bars={[
              { dataKey: "Mentions", name: "Mentions", color: "#9b87f5" }
            ]}
            title=""
            layout="horizontal"
            height={450}
            className="domains-chart w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainChart;
