
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useWidgetPermissions } from '@/hooks/use-widget-permissions';
import { useFilteredFeeds } from '@/hooks/use-filtered-feeds';
import { toast } from '@/hooks/use-toast';
import { useDashboardPermissions } from '@/hooks/use-dashboard-permissions';
import DashboardTabs from '@/components/Dashboard/DashboardTabs';
import { 
  DashboardLoadingState, 
  DashboardErrorState, 
  DashboardEmptyState 
} from '@/components/Dashboard/DashboardStates';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.username) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Current user data:', user);
  
  const { 
    data: permissions = [], 
    isLoading: permissionsLoading, 
    error: permissionsError,
    refetch: refetchPermissions
  } = useWidgetPermissions(user.username);

  const { hasPermission, hasAnyNewsFeed } = useDashboardPermissions(permissions);

  const {
    feeds: dataFeeds,
    isLoading: dataFeedsLoading,
    error: dataFeedsError,
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
    refetch: refetchDataFeeds,
    resetFilters
  } = useFilteredFeeds();

  // Enhanced function to handle tab changes without scrolling
  const handleTabChange = (value: string) => {
    // Immediately prevent any scrolling
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    
    // Also apply after a short timeout to catch delayed scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }, 10);
  };
  
  // Add an effect to maintain scroll position
  useEffect(() => {
    const maintainScrollPosition = () => {
      window.scrollTo(0, 0);
    };
    
    // Run on mount
    maintainScrollPosition();
    
    // Return cleanup function
    return () => {};
  }, []);

  useEffect(() => {
    refetchPermissions();
  }, [refetchPermissions]);

  useEffect(() => {
    if (dataFeedsError) {
      toast({
        title: 'Error fetching data feeds',
        description: dataFeedsError instanceof Error ? dataFeedsError.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  }, [dataFeedsError]);

  if (permissionsLoading) {
    return (
      <DashboardLayout>
        <DashboardLoadingState />
      </DashboardLayout>
    );
  }

  if (permissionsError) {
    console.error('Permissions error:', permissionsError);
    return (
      <DashboardLayout>
        <DashboardErrorState 
          error={permissionsError} 
          refetch={refetchPermissions} 
        />
      </DashboardLayout>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <DashboardLayout>
        <DashboardEmptyState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardTabs 
        permissions={permissions}
        hasPermission={hasPermission}
        hasAnyNewsFeed={hasAnyNewsFeed}
        dataFeeds={dataFeeds}
        dataFeedsLoading={dataFeedsLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedClassification={selectedClassification}
        setSelectedClassification={setSelectedClassification}
        selectedReleasability={selectedReleasability}
        setSelectedReleasability={setSelectedReleasability}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        classifications={classifications}
        releasability={releasability}
        resetFilters={resetFilters}
        refetchDataFeeds={refetchDataFeeds}
        user={user}
        handleTabChange={handleTabChange}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
