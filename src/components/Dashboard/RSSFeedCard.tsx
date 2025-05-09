
import React from 'react';
import { Rss, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface RSSFeedCardProps {
  title: string;
  feedUrl: string;
}

const RSSFeedCard: React.FC<RSSFeedCardProps> = ({ title, feedUrl }) => {
  const fetchFeed = async (): Promise<FeedItem[]> => {
    try {
      console.log(`Fetching RSS feed from: ${feedUrl}`);
      
      // Use our own Supabase Edge Function to fetch and parse the RSS feed
      const { data, error } = await supabase.functions.invoke('rss-proxy', {
        body: { feedUrl }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to fetch feed: ${error.message}`);
      }
      
      if (!data || !data.items) {
        console.error("Invalid response format:", data);
        throw new Error('Invalid response format from RSS proxy');
      }
      
      console.log(`Successfully retrieved ${data.items.length} RSS items`);
      return data.items;
    } catch (err) {
      console.error("Failed to fetch RSS feed:", err);
      toast({
        title: "Failed to load feed",
        description: "Could not load the news feed. Please try again later.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['rssFeed', feedUrl],
    queryFn: fetchFeed,
    retry: 3,
    retryDelay: 3000,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing feed",
      description: "Getting the latest news updates."
    });
  };
  
  // Format date function with robust error handling
  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === '') {
      return 'Recent';
    }

    try {
      // Try to create a Date object
      const date = new Date(dateStr);
      
      // If it's a valid date, format it
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
      
      // Sometimes dates come in Unix timestamp format
      if (/^\d+$/.test(dateStr)) {
        const timestamp = parseInt(dateStr);
        const timestampDate = new Date(timestamp);
        if (!isNaN(timestampDate.getTime())) {
          return timestampDate.toLocaleString();
        }
      }
      
      // Just return the original string if we can't parse it
      return dateStr;
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Recent';
    }
  };
  
  // Function to safely truncate and clean description text
  const cleanDescription = (description: string): string => {
    if (!description) return '';
    
    // Remove HTML tags
    const textOnly = description.replace(/<\/?[^>]+(>|$)/g, " ");
    
    // Truncate to reasonable length
    return textOnly.length > 150 ? textOnly.substring(0, 147) + '...' : textOnly;
  };

  return (
    <Card className="h-[300px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold truncate pr-2">{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2 shrink-0"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Rss className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load feed. Please try again later.
            </AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <Alert>
            <AlertDescription>
              No items found in feed. Try refreshing.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2">
            {items.map((item, index) => (
              <div
                key={`news-item-${index}`}
                className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
              >
                <a
                  href={item.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 rounded-lg transition-colors p-2 -mx-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-indigo-600 mb-1 line-clamp-2 break-words pr-1">
                      {item.title || 'Untitled Article'}
                    </h3>
                    <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                      {cleanDescription(item.description)}
                    </p>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="truncate">{formatDate(item.pubDate)}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RSSFeedCard;
