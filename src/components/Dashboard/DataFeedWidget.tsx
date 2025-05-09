
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface DataFeedProps {
  feed: {
    feed_id: string;
    title: string;
    content: string | null;
    source: string;
    timestamp: string;
    security_classification: string;
    releasability: string;
    metadata?: any;
    feed_frequency?: string | null;
    PIR?: string | null;
    url?: string | null;
  };
}

const DataFeedWidget: React.FC<DataFeedProps> = ({ feed }) => {
  const formattedDate = new Date(feed.timestamp).toLocaleString();
  
  const getClassificationColor = (classification: string) => {
    const lowerClass = classification.toLowerCase();
    if (lowerClass.includes('top secret') || lowerClass.includes('ts')) return 'bg-red-100 text-red-800';
    if (lowerClass.includes('secret')) return 'bg-yellow-100 text-yellow-800';
    if (lowerClass.includes('confidential')) return 'bg-blue-100 text-blue-800';
    if (lowerClass.includes('unclassified') || lowerClass.includes('u')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const getReleasabilityColor = (releasability: string) => {
    const lowerRel = releasability.toLowerCase();
    if (lowerRel.includes('noforn')) return 'bg-purple-100 text-purple-800';
    if (lowerRel.includes('relido')) return 'bg-indigo-100 text-indigo-800';
    if (lowerRel.includes('orcon')) return 'bg-orange-100 text-orange-800';
    if (lowerRel.includes('rel to')) return 'bg-teal-100 text-teal-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-indigo-700">
            {feed.url ? (
              <a 
                href={feed.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                {feed.title}
                <ExternalLink className="h-3 w-3 inline ml-1" />
              </a>
            ) : (
              feed.title
            )}
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline" className={getClassificationColor(feed.security_classification)}>
              {feed.security_classification}
            </Badge>
            <Badge variant="outline" className={getReleasabilityColor(feed.releasability)}>
              {feed.releasability}
            </Badge>
          </div>
        </div>
        {feed.content && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{feed.content}</p>
        )}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Source: {feed.source}</span>
          <span>{formattedDate}</span>
        </div>
        {feed.PIR && (
          <div className="mt-2 text-xs text-gray-500">
            PIR: {feed.PIR}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataFeedWidget;
