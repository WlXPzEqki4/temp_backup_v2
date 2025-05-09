
import React from 'react';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsContent from './Analytics/AnalyticsContent';
import AnalyticsLoading from './Analytics/AnalyticsLoading';
import AnalyticsError from './Analytics/AnalyticsError';

const AnalyticsTab: React.FC = () => {
  const { 
    narratives, 
    domains, 
    authors, 
    languages, 
    sentiment,
    voiceShare,
    volumeTime,
    workspaces,
    isLoading, 
    error 
  } = useAnalyticsData();

  if (isLoading) {
    return <AnalyticsLoading />;
  }

  if (error) {
    return <AnalyticsError error={error} />;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500">
              View and analyze data across different workspaces with individual controls for each visualization
            </p>
          </div>
          
          <AnalyticsContent 
            narratives={narratives}
            domains={domains}
            authors={authors}
            languages={languages}
            sentiment={sentiment}
            voiceShare={voiceShare}
            volumeTime={volumeTime}
            workspaces={workspaces}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
