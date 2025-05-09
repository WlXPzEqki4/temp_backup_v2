
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Search, RefreshCw, RotateCcw } from 'lucide-react';

interface DataFeedControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassification: string;
  onClassificationChange: (value: string) => void;
  selectedReleasability: string;
  onReleasabilityChange: (value: string) => void;
  sortField: string;
  onSortFieldChange: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: () => void;
  classifications: string[];
  releasability: string[];
  onResetFilters: () => void;
  onRefreshData: () => void;
}

export const DataFeedControls: React.FC<DataFeedControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedClassification,
  onClassificationChange,
  selectedReleasability,
  onReleasabilityChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  classifications,
  releasability,
  onResetFilters,
  onRefreshData
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search feeds..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortField} onValueChange={onSortFieldChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timestamp">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="security_classification">Classification</SelectItem>
            <SelectItem value="releasability">Releasability</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={onSortDirectionChange}
          className="w-10"
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="outline"
          size="icon"
          onClick={onRefreshData}
          className="w-10"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedClassification} onValueChange={onClassificationChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_classifications">All Classifications</SelectItem>
            {classifications.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedReleasability} onValueChange={onReleasabilityChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by releasability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_releasability">All Releasability</SelectItem>
            {releasability.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={onResetFilters}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
