
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsItem } from '@/types/news';

export const useNews = (type: 'breaking' | 'uae', enabled: boolean) => {
  const fetchNews = async (): Promise<NewsItem[]> => {
    console.log(`Fetching ${type} news...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('news-proxy', {
        body: { type }
      });

      if (error) {
        console.error(`Error fetching ${type} news:`, error);
        throw error;
      }

      if (!data) {
        console.error(`No data returned for ${type} news`);
        throw new Error(`No ${type} news data returned`);
      }
      
      if (!data.articles) {
        console.error(`No articles in data for ${type} news:`, data);
        throw new Error(`No ${type} news articles found`);
      }

      return data.articles;
    } catch (error) {
      console.error(`Failed to fetch ${type} news:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: [`${type}News`],
    queryFn: fetchNews,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
    enabled,
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    // Add better error handling
    meta: {
      errorMessage: `Unable to load ${type} news. Using fallback data.`
    }
  });
};
