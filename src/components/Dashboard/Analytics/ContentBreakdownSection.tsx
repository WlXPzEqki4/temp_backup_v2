
import React, { useState } from 'react';
import DonutChart from '../Charts/DonutChart';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WorkspaceSelector from './WorkspaceSelector';
import { AlertTriangle } from 'lucide-react';

interface ContentBreakdownSectionProps {
  allLanguages: any[];
  allVoiceShare: any[];
  workspaces: string[];
}

const ContentBreakdownSection: React.FC<ContentBreakdownSectionProps> = ({ allLanguages, allVoiceShare, workspaces }) => {
  const [languagesWorkspace, setLanguagesWorkspace] = useState<string | 'all'>("UAE - News (Africa)");
  const [voiceShareWorkspace, setVoiceShareWorkspace] = useState<string | 'all'>("UAE - News (Africa)");
  
  const donutChartColors = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#F97316', '#0EA5E9'];
  
  // Filter data based on selected workspaces
  const filteredLanguages = languagesWorkspace === 'all' 
    ? allLanguages 
    : allLanguages.filter(item => item.Workspace === languagesWorkspace);
  
  const filteredVoiceShare = voiceShareWorkspace === 'all' 
    ? allVoiceShare 
    : allVoiceShare.filter(item => item.Workspace === voiceShareWorkspace);
  
  // Check if we have data
  const hasLanguagesData = filteredLanguages && filteredLanguages.length > 0;
  const hasVoiceShareData = filteredVoiceShare && filteredVoiceShare.length > 0;
  
  // Prepare display data
  const languagesToDisplay = hasLanguagesData 
    ? filteredLanguages.slice(0, 6)
    : [{ Language: "No data", Mentions: 1 }];
    
  const voiceShareToDisplay = hasVoiceShareData
    ? filteredVoiceShare
    : [{ Date: "No data", Mentions: 1 }];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Languages - Donut chart */}
      <Card className={`shadow-sm ${!hasLanguagesData ? "border-yellow-200" : ""}`}>
        <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
          <h3 className="text-lg font-medium">Content by Language</h3>
          <WorkspaceSelector
            selectedWorkspace={languagesWorkspace}
            setSelectedWorkspace={setLanguagesWorkspace}
            workspaces={workspaces}
            className="ml-auto"
          />
        </CardHeader>
        <CardContent className="p-0 pt-2 flex items-center justify-center overflow-visible" style={{ minHeight: "450px" }}>
          {!hasLanguagesData && (
            <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-50 text-yellow-800 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">No language data available for the selected workspace</span>
            </div>
          )}
          <DonutChart 
            data={languagesToDisplay}
            dataKey="Mentions"
            nameKey="Language"
            colors={donutChartColors}
            title=""
            showLegend={true}
            legendOffset={60}
            height={360}
          />
        </CardContent>
      </Card>
      
      {/* Share of Voice - Donut chart without legend */}
      <Card className={`shadow-sm ${!hasVoiceShareData ? "border-yellow-200" : ""}`}>
        <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
          <h3 className="text-lg font-medium">Share of Voice</h3>
          <WorkspaceSelector
            selectedWorkspace={voiceShareWorkspace}
            setSelectedWorkspace={setVoiceShareWorkspace}
            workspaces={workspaces}
            className="ml-auto"
          />
        </CardHeader>
        <CardContent className="p-0 pt-2 flex items-center justify-center overflow-visible" style={{ minHeight: "450px" }}>
          {!hasVoiceShareData && (
            <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-50 text-yellow-800 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">No voice share data available for the selected workspace</span>
            </div>
          )}
          <DonutChart 
            data={voiceShareToDisplay}
            dataKey="Mentions" 
            nameKey="Date"
            colors={donutChartColors}
            title=""
            showLegend={false}
            height={360}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentBreakdownSection;
