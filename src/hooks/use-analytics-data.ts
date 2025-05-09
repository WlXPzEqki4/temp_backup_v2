
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Types for our analytics data
export interface NarrativeData {
  Narrative: string | null;
  Mentions: number | null;
  "First Seen": string | null;
  "Last Seen": string | null;
  Created: string | null;
  Workspace: string | null;
}

export interface DomainData {
  Domain: string | null;
  Mentions: number | null;
  Workspace: string | null;
}

export interface AuthorData {
  Author: string | null;
  Mentions: number | null;
  Workspace: string | null;
}

export interface LanguageData {
  Language: string | null;
  Mentions: number | null;
  Workspace: string | null;
}

export interface SentimentData {
  Date: string | null;
  "Positive Sentiment": number | null;
  "Neutral Sentiment": number | null;
  "Negative Sentiment": number | null;
  Mentions: number | null;
  Workspace: string | null;
}

export interface VoiceShareData {
  Date: string | null;
  "Positive Sentiment": string | null;
  "Neutral Sentiment": string | null;
  "Negative Sentiment": string | null;
  Mentions: number | null;
  Workspace: string | null;
}

export interface VolumeTimeData {
  Date: string | null;
  Mentions: number | null;
  "Positive Sentiment": string | null;
  "Neutral Sentiment": string | null;
  "Negative Sentiment": string | null;
  Workspace: string | null;
}

export interface AnalyticsData {
  narratives: NarrativeData[];
  domains: DomainData[];
  authors: AuthorData[];
  languages: LanguageData[];
  sentiment: SentimentData[];
  voiceShare: VoiceShareData[];
  volumeTime: VolumeTimeData[];
  workspaces: string[];
  isLoading: boolean;
  error: Error | null;
}

export const useAnalyticsData = (): AnalyticsData => {
  const [narratives, setNarratives] = useState<NarrativeData[]>([]);
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData[]>([]);
  const [voiceShare, setVoiceShare] = useState<VoiceShareData[]>([]);
  const [volumeTime, setVolumeTime] = useState<VolumeTimeData[]>([]);
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch narratives
        const { data: narrativesData, error: narrativesError } = await supabase
          .from('analytics_narratives')
          .select('*');
        
        if (narrativesError) throw narrativesError;
        console.log('Fetched narratives data:', narrativesData?.length);
        setNarratives(narrativesData || []);
        
        // Fetch domains
        const { data: domainsData, error: domainsError } = await supabase
          .from('analytics_domains')
          .select('*');
        
        if (domainsError) throw domainsError;
        console.log('Fetched domains data:', domainsData?.length);
        setDomains(domainsData || []);
        
        // Fetch authors
        const { data: authorsData, error: authorsError } = await supabase
          .from('analytics_authors')
          .select('*');
        
        if (authorsError) throw authorsError;
        console.log('Fetched authors data:', authorsData?.length);
        setAuthors(authorsData || []);
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('analytics_languages')
          .select('*');
        
        if (languagesError) throw languagesError;
        console.log('Fetched languages data:', languagesData?.length);
        setLanguages(languagesData || []);
        
        // Fetch sentiment
        const { data: sentimentData, error: sentimentError } = await supabase
          .from('analytics_sentiment')
          .select('*');
        
        if (sentimentError) throw sentimentError;
        console.log('Fetched sentiment data:', sentimentData?.length);
        setSentiment(sentimentData || []);
        
        // Fetch voice share
        const { data: voiceShareData, error: voiceShareError } = await supabase
          .from('analytics_voice_share')
          .select('*');
        
        if (voiceShareError) throw voiceShareError;
        console.log('Fetched voice share data:', voiceShareData?.length);
        setVoiceShare(voiceShareData || []);
        
        // Fetch volume time
        const { data: volumeTimeData, error: volumeTimeError } = await supabase
          .from('analytics_volume_time')
          .select('*');
        
        if (volumeTimeError) throw volumeTimeError;
        console.log('Fetched volume time data:', volumeTimeData?.length);
        setVolumeTime(volumeTimeData || []);
        
        // Extract unique workspaces
        const allWorkspaces = new Set<string>();
        
        [narrativesData, domainsData, authorsData, languagesData, sentimentData, voiceShareData, volumeTimeData]
          .forEach(dataset => {
            dataset?.forEach(item => {
              if (item.Workspace) allWorkspaces.add(item.Workspace.trim());
            });
          });
        
        const workspacesList = Array.from(allWorkspaces);
        console.log('Extracted workspaces:', workspacesList);
        setWorkspaces(workspacesList);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
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
  };
};
