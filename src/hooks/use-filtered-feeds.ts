import { useMemo, useState } from 'react';
import { DataFeed, useDataFeeds } from './use-data-feeds';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SortField = 'title' | 'timestamp' | 'security_classification' | 'releasability';
export type SortDirection = 'asc' | 'desc';

export const useFilteredFeeds = () => {
  const { data: feeds = [], isLoading, error, refetch } = useDataFeeds();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all_classifications');
  const [selectedReleasability, setSelectedReleasability] = useState<string>('all_releasability');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch user's available classification and releasability levels
  const { data: userAccess } = useQuery({
    queryKey: ['user-access'],
    queryFn: async () => {
      const username = JSON.parse(localStorage.getItem('user') || '{}').username;
      if (!username) return null;

      const { data, error } = await supabase
        .from('user_access')
        .select('classification_levels, releasability_levels')
        .eq('username', username)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Get unique classifications and releasability levels from the user's access levels
  const { classifications, releasability } = useMemo(() => {
    if (!userAccess) return { classifications: [], releasability: [] };

    return {
      classifications: userAccess.classification_levels.split(',').map(level => level.trim()),
      releasability: userAccess.releasability_levels.split(',').map(level => level.trim())
    };
  }, [userAccess]);

  // Reset all filters to default values
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClassification('all_classifications');
    setSelectedReleasability('all_releasability');
    setSortField('timestamp');
    setSortDirection('desc');
  };

  // Filter and sort the feeds
  const filteredAndSortedFeeds = useMemo(() => {
    // First apply filters
    let result = feeds.filter((feed) => {
      const matchesSearch = !searchQuery || 
        feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.content?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesClassification = selectedClassification === 'all_classifications' || 
        feed.security_classification === selectedClassification;
        
      const matchesReleasability = selectedReleasability === 'all_releasability' || 
        feed.releasability === selectedReleasability;

      return matchesSearch && matchesClassification && matchesReleasability;
    });

    // Then sort
    return result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'security_classification':
          comparison = a.security_classification.localeCompare(b.security_classification);
          break;
        case 'releasability':
          comparison = a.releasability.localeCompare(b.releasability);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [feeds, searchQuery, selectedClassification, selectedReleasability, sortField, sortDirection]);

  return {
    feeds: filteredAndSortedFeeds,
    isLoading,
    error,
    refetch,
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
  };
};
