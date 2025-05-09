
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NewsItem } from '@/types/news';

interface NewsCardProps {
  title: string;
  articles: NewsItem[];
  isLoading: boolean;
  error: unknown;
  enabled: boolean;
  onRefresh: () => void;
}

const NewsCard = ({ 
  title, 
  articles, 
  isLoading, 
  error, 
  enabled, 
  onRefresh 
}: NewsCardProps) => {
  if (!enabled) return null;
  
  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRefresh();
  };

  const isFallbackData = error && articles.length > 0;
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">
          {title}
          {isFallbackData && (
            <span className="ml-2 text-xs text-amber-500 font-normal">
              (Using sample data)
            </span>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <Alert variant={error ? "destructive" : "default"} className="mb-4">
            <AlertDescription>
              {error 
                ? "Unable to load news articles. Please try again later." 
                : "No news articles found. Try refreshing."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {articles.slice(0, 5).map((article, index) => (
              <div
                key={`${article.title}-${index}`}
                className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 rounded-lg transition-colors p-2 -mx-2"
                >
                  <h3 className="font-medium text-indigo-600 mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{article.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Source: {article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleString()}</span>
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

export default NewsCard;
