
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type DataFeed = Database['public']['Tables']['data_feeds']['Row'];

export const useDataFeeds = () => {
  const fetchDataFeeds = async (): Promise<DataFeed[]> => {
    console.log('Fetching data feeds from supabase...');
    
    // First get user's permissions
    const username = JSON.parse(localStorage.getItem('user') || '{}').username;
    if (!username) {
      console.log('No username found, returning empty array');
      return [];
    }

    const { data: userAccess, error: userError } = await supabase
      .from('user_access')
      .select('classification_levels, releasability_levels')
      .eq('username', username)
      .single();

    if (userError) {
      console.error('Error fetching user access levels:', userError);
      throw userError;
    }

    if (!userAccess) {
      console.log('No user access levels found');
      return [];
    }

    // Parse the comma-separated strings into arrays
    const allowedClassifications = userAccess.classification_levels
      .split(',')
      .map(level => level.trim().toUpperCase());
    const allowedReleasability = userAccess.releasability_levels
      .split(',')
      .map(level => level.trim().toUpperCase());

    console.log('User permissions:', {
      classifications: allowedClassifications,
      releasability: allowedReleasability,
      username
    });

    // Fetch all data feeds
    const { data: feeds, error } = await supabase
      .from('data_feeds')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching data feeds:', error);
      throw error;
    }
    
    // Fixed filtering logic for exact classification level matching
    const filteredFeeds = feeds?.filter(feed => {
      const feedClassification = feed.security_classification.trim().toUpperCase();
      const feedReleasability = feed.releasability.trim().toUpperCase();

      // Check if ANY of the user's allowed classifications match this feed exactly
      const hasClassificationAccess = allowedClassifications.some(level => {
        // Use exact classification matching (not substring)
        return feedClassification === level;
      });

      // Check if ANY of the user's allowed releasability levels match this feed exactly
      const hasReleasabilityAccess = allowedReleasability.some(level => {
        // Use exact releasability matching (not substring)
        return feedReleasability === level;
      });

      const isAccessible = hasClassificationAccess && hasReleasabilityAccess;
      
      // For debugging
      if (username === 'user2' && feedClassification === 'TOP SECRET') {
        console.log(`user2 denied access to TOP SECRET item: ${feed.title}`);
      }

      return isAccessible;
    }) || [];

    console.log(`Filtered ${feeds?.length || 0} feeds down to ${filteredFeeds.length} for user ${username} based on user permissions`);
    return filteredFeeds;
  };

  return useQuery({
    queryKey: ['dataFeeds'],
    queryFn: fetchDataFeeds,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2
  });
};
