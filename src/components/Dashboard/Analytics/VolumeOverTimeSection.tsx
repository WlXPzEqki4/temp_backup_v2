
import React, { useState } from 'react';
import LineChart from '../Charts/LineChart';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WorkspaceSelector from './WorkspaceSelector';
import { AlertTriangle } from 'lucide-react';

interface VolumeOverTimeSectionProps {
  allData: any[];
  workspaces: string[];
}

const VolumeOverTimeSection: React.FC<VolumeOverTimeSectionProps> = ({ allData, workspaces }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | 'all'>("UAE - News (Africa)");
  
  // Filter data based on selected workspace
  const filteredData = selectedWorkspace === 'all' 
    ? allData 
    : allData.filter(item => item.Workspace === selectedWorkspace);
  
  // Check if we have data
  const hasData = filteredData && filteredData.length > 0;
  
  // Process data to format dates - remove time part from date strings
  const formattedData = hasData
    ? filteredData.map(item => ({
        ...item,
        // Format date by removing the time part (everything from T onwards)
        Date: item.Date && typeof item.Date === 'string' 
          ? item.Date.split('T')[0] 
          : item.Date
      }))
    : [{ Date: new Date().toISOString().split('T')[0], Mentions: 0 }];
  
  return (
    <Card className={`shadow-sm mb-8 ${!hasData ? "border-yellow-200" : ""}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Volume Over Time</h3>
        <WorkspaceSelector
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={setSelectedWorkspace}
          workspaces={workspaces}
          className="ml-auto"
        />
      </CardHeader>
      <CardContent className="p-4">
        {!hasData && (
          <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-50 text-yellow-800 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">No data available for the selected workspace</span>
          </div>
        )}
        <LineChart 
          data={formattedData}
          xDataKey="Date"
          lines={[
            { dataKey: "Mentions", name: "Mentions", color: "#9b87f5" }
          ]}
          title=""
          height={450}
          className="pt-2"
          yAxisLabel="Mentions"
          hideActiveDot={true}
          hideLegend={true}
        />
      </CardContent>
    </Card>
  );
};

export default VolumeOverTimeSection;
