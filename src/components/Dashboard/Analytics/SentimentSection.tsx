
import React, { useState } from 'react';
import BarChart from '../Charts/BarChart';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WorkspaceSelector from './WorkspaceSelector';
import { AlertTriangle } from 'lucide-react';

interface SentimentSectionProps {
  allSentiment: any[];
  workspaces: string[];
}

const SentimentSection: React.FC<SentimentSectionProps> = ({ allSentiment, workspaces }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | 'all'>("UAE - News (Africa)");
  
  // Filter data based on selected workspaces
  const filteredSentiment = selectedWorkspace === 'all' 
    ? allSentiment 
    : allSentiment.filter(item => item.Workspace === selectedWorkspace);
  
  // Check if we have data
  const hasData = filteredSentiment && filteredSentiment.length > 0;
  
  // Process data to format dates - remove time part from date strings
  const formattedSentiment = hasData
    ? filteredSentiment.map(item => ({
        ...item,
        // Format date by removing the time part (everything from T onwards)
        Date: item.Date && typeof item.Date === 'string' 
          ? item.Date.split('T')[0] 
          : item.Date
      }))
    : [{ Date: "No data", "Positive Sentiment": 0, "Neutral Sentiment": 0, "Negative Sentiment": 0 }];
  
  return (
    <Card className={`shadow-sm mb-8 ${!hasData ? "border-yellow-200" : ""}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Sentiment Analysis</h3>
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
            <span className="text-xs">No sentiment data available for the selected workspace</span>
          </div>
        )}
        <BarChart 
          data={formattedSentiment}
          xDataKey="Date"
          bars={[
            { dataKey: "Positive Sentiment", name: "Positive", color: "#0EA5E9" },
            { dataKey: "Neutral Sentiment", name: "Neutral", color: "#8E9196" },
            { dataKey: "Negative Sentiment", name: "Negative", color: "#F97316" }
          ]}
          title=""
          layout="horizontal"
          height={320}
        />
      </CardContent>
    </Card>
  );
};

export default SentimentSection;
