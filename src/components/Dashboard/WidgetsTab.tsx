import React from 'react';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import CryptoWidget from '@/components/Dashboard/CryptoWidget';
import RSSFeedCard from '@/components/Dashboard/RSSFeedCard';
import NewsFeeds from '@/components/Dashboard/NewsFeeds';

interface WidgetsTabProps {
  permissions: any[];
  hasPermission: (type: 'weather' | 'crypto' | 'rss' | 'news', instance: string) => boolean;
  hasAnyNewsFeed: () => boolean;
}

const WidgetsTab: React.FC<WidgetsTabProps> = ({ permissions, hasPermission, hasAnyNewsFeed }) => {
  const weatherPermissions = permissions.filter(p => p.widget_type === 'weather' && p.is_enabled);
  const cryptoPermissions = permissions.filter(p => p.widget_type === 'crypto' && p.is_enabled);
  const rssPermissions = permissions.filter(p => p.widget_type === 'rss' && p.is_enabled);

  return (
    <div>
      {weatherPermissions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* We'll keep the database keys as 'abu_dhabi' and 'dubai' but display as Khartoum and Omdurman */}
            {hasPermission('weather', 'abu_dhabi') && (
              <WeatherWidget city="Khartoum" />
            )}
            
            {hasPermission('weather', 'dubai') && (
              <WeatherWidget city="Omdurman" />
            )}
          </div>

          <div className="space-y-6">
            {hasPermission('crypto', 'bitcoin') && (
              <CryptoWidget coinId="bitcoin" name="Bitcoin" />
            )}
            
            {hasPermission('crypto', 'ethereum') && (
              <CryptoWidget coinId="ethereum" name="Ethereum" />
            )}
          </div>
        </div>
      )}

      {rssPermissions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {hasPermission('rss', 'npr') && (
            <RSSFeedCard 
              title="NPR News" 
              feedUrl="https://feeds.npr.org/1001/rss.xml"
            />
          )}
          
          {hasPermission('rss', 'bbc') && (
            <RSSFeedCard 
              title="BBC News" 
              feedUrl="http://feeds.bbci.co.uk/news/rss.xml"
            />
          )}
        </div>
      )}

      {hasAnyNewsFeed() && (
        <div className="mb-6">
          <NewsFeeds />
        </div>
      )}
    </div>
  );
};

export default WidgetsTab;
