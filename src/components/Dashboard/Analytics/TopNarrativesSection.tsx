
import React, { useState } from 'react';
import DataTable from '../Charts/DataTable';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WorkspaceSelector from './WorkspaceSelector';
import { AlertTriangle } from 'lucide-react';

interface TopNarrativesSectionProps {
  allNarratives: any[];
  workspaces: string[];
}

const TopNarrativesSection: React.FC<TopNarrativesSectionProps> = ({ allNarratives, workspaces }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | 'all'>("UAE - News (Africa)");
  
  // Filter data based on selected workspaces
  const filteredNarratives = selectedWorkspace === 'all' 
    ? allNarratives 
    : allNarratives.filter(item => item.Workspace === selectedWorkspace);
  
  // Check if we have data
  const hasData = filteredNarratives && filteredNarratives.length > 0;
  
  // Prepare display data
  const dataToDisplay = hasData
    ? filteredNarratives
    : [{ Narrative: "No data available", Mentions: 0, "First Seen": null, "Last Seen": null }];
  
  return (
    <Card className={`shadow-sm ${!hasData ? "border-yellow-200" : ""}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Top Narratives</h3>
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
            <span className="text-xs">No narrative data available for the selected workspace</span>
          </div>
        )}
        <DataTable 
          data={dataToDisplay}
          columns={[
            { key: "Narrative", header: "Narrative" },
            { key: "Mentions", header: "Mentions" },
            { key: "First Seen", header: "First Seen", 
              render: (value) => value ? new Date(value).toLocaleDateString() : "-" },
            { key: "Last Seen", header: "Last Seen",
              render: (value) => value ? new Date(value).toLocaleDateString() : "-" }
          ]}
          title=""
          pageSize={5}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

export default TopNarrativesSection;
