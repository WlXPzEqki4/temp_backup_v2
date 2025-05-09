
import React from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { DataFeedControls } from '@/components/Dashboard/DataFeedControls';
import DataFeedWidget from '@/components/Dashboard/DataFeedWidget';
import { SortField } from '@/hooks/use-filtered-feeds';

interface NewsTabProps {
  permissions: any[];
  dataFeeds: any[];
  dataFeedsLoading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedClassification: string;
  setSelectedClassification: (value: string) => void;
  selectedReleasability: string;
  setSelectedReleasability: (value: string) => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc' | ((prev: 'asc' | 'desc') => 'asc' | 'desc')) => void;
  classifications: string[];
  releasability: string[];
  resetFilters: () => void;
  refetchDataFeeds: () => void;
}

const NewsTab: React.FC<NewsTabProps> = ({
  permissions,
  dataFeeds,
  dataFeedsLoading,
  searchQuery,
  setSearchQuery,
  selectedClassification,
  setSelectedClassification,
  selectedReleasability,
  setSelectedReleasability,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  classifications,
  releasability,
  resetFilters,
  refetchDataFeeds,
}) => {
  const handleRefreshDataFeeds = () => {
    refetchDataFeeds();
    toast({
      title: 'Refreshing data feeds',
      description: 'Latest data feeds are being fetched.',
    });
  };

  return (
    <div className="space-y-4">
      {permissions?.some(p => p.widget_type === 'news') ? (
        dataFeedsLoading ? (
          <div className="flex items-center justify-center h-64 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-lg text-gray-500">Loading data feeds...</p>
          </div>
        ) : dataFeeds.length > 0 ? (
          <>
            <DataFeedControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClassification={selectedClassification}
              onClassificationChange={setSelectedClassification}
              selectedReleasability={selectedReleasability}
              onReleasabilityChange={setSelectedReleasability}
              sortField={sortField}
              onSortFieldChange={(value) => setSortField(value as SortField)}
              sortDirection={sortDirection}
              onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              classifications={classifications}
              releasability={releasability}
              onResetFilters={resetFilters}
              onRefreshData={handleRefreshDataFeeds}
            />
            <div className="grid gap-4">
              {dataFeeds.map(feed => (
                <DataFeedWidget key={feed.feed_id} feed={feed} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-lg text-gray-500">No data feeds available with the current filters.</p>
            <div className="flex gap-4">
              <Button 
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
              <Button 
                onClick={handleRefreshDataFeeds}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Refresh Data Feeds
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">No access to news feeds.</p>
        </div>
      )}
    </div>
  );
};

export default NewsTab;
