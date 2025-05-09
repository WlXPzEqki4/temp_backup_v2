
import React, { useEffect } from 'react';
import VolumeOverTimeSection from './VolumeOverTimeSection';
import TopSourcesSection from './TopSourcesSection';
import ContentBreakdownSection from './ContentBreakdownSection';
import SentimentSection from './SentimentSection';
import TopNarrativesSection from './TopNarrativesSection';

interface AnalyticsContentProps {
  narratives: any[];
  domains: any[];
  authors: any[];
  languages: any[];
  sentiment: any[];
  voiceShare: any[];
  volumeTime: any[];
  workspaces: string[];
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({
  narratives,
  domains,
  authors,
  languages,
  sentiment,
  voiceShare,
  volumeTime,
  workspaces,
}) => {
  // Debug data loaded into each component
  useEffect(() => {
    console.log('Analytics Content - Data Statistics:');
    console.log(`- Narratives: ${narratives?.length || 0}`);
    console.log(`- Domains: ${domains?.length || 0}`);
    console.log(`- Authors: ${authors?.length || 0}`);
    console.log(`- Languages: ${languages?.length || 0}`);
    console.log(`- Sentiment: ${sentiment?.length || 0}`);
    console.log(`- Voice Share: ${voiceShare?.length || 0}`);
    console.log(`- Volume Time: ${volumeTime?.length || 0}`);
    console.log(`- Workspaces: ${workspaces?.length || 0} - ${workspaces?.join(', ')}`);
  }, [narratives, domains, authors, languages, sentiment, voiceShare, volumeTime, workspaces]);

  return (
    <div className="space-y-10">
      <VolumeOverTimeSection allData={volumeTime} workspaces={workspaces} />
      <div className="min-h-[700px]">
        <TopSourcesSection
          allDomains={domains}
          allAuthors={authors}
          workspaces={workspaces}
        />
      </div>
      <ContentBreakdownSection allLanguages={languages} allVoiceShare={voiceShare} workspaces={workspaces} />
      <SentimentSection allSentiment={sentiment} workspaces={workspaces} />
      <TopNarrativesSection allNarratives={narratives} workspaces={workspaces} />
    </div>
  );
};

export default AnalyticsContent;
