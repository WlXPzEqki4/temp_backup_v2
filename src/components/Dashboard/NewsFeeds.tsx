
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { useWidgetPermissions } from '@/hooks/use-widget-permissions';
import { useNews } from '@/hooks/use-news';
import NewsCard from './News/NewsCard';

const NewsFeeds = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { data: permissions = [] } = useWidgetPermissions(user.username);
  
  const hasPermission = (instance: string) => {
    return permissions.some(p => 
      p.widget_type === 'news' && 
      p.widget_instance === instance && 
      p.is_enabled
    );
  };

  const { 
    data: breakingNews = [], 
    isLoading: isBreakingLoading,
    refetch: refetchBreaking,
    error: breakingError 
  } = useNews('breaking', hasPermission('feed1'));

  const { 
    data: uaeNews = [], 
    isLoading: isUAELoading,
    refetch: refetchUAE,
    error: uaeError
  } = useNews('uae', hasPermission('feed2'));

  React.useEffect(() => {
    if (breakingError) {
      console.error('Breaking News Error:', breakingError);
      toast({
        title: 'Notice about breaking news',
        description: 'Using fallback news data due to API limitations',
        variant: 'default',
      });
    }
  }, [breakingError]);

  React.useEffect(() => {
    if (uaeError) {
      console.error('UAE News Error:', uaeError);
      toast({
        title: 'Notice about UAE news',
        description: 'Using fallback news data due to API limitations',
        variant: 'default',
      });
    }
  }, [uaeError]);

  const handleRefresh = async () => {
    const refreshPromises = [];
    
    if (hasPermission('feed1')) {
      refreshPromises.push(refetchBreaking());
    }
    
    if (hasPermission('feed2')) {
      refreshPromises.push(refetchUAE());
    }
    
    try {
      await Promise.all(refreshPromises);
      toast({
        title: 'News feeds updated',
        description: 'Latest news has been fetched successfully.',
      });
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast({
        title: 'Could not update news',
        description: 'Using available news data. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {hasPermission('feed1') && (
        <NewsCard 
          title="Breaking News" 
          articles={breakingNews} 
          isLoading={isBreakingLoading} 
          error={breakingError}
          enabled={hasPermission('feed1')}
          onRefresh={handleRefresh}
        />
      )}
      {hasPermission('feed2') && (
        <NewsCard 
          title="UAE News" 
          articles={uaeNews} 
          isLoading={isUAELoading} 
          error={uaeError}
          enabled={hasPermission('feed2')}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default NewsFeeds;
