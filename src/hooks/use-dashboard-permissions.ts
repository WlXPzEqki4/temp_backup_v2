
import { useState, useCallback } from 'react';

export const useDashboardPermissions = (permissions: any[] = []) => {
  const hasPermission = useCallback((type: 'weather' | 'crypto' | 'rss' | 'news', instance: string): boolean => {
    if (!permissions || permissions.length === 0) {
      console.log(`No permissions found for ${type}/${instance}`);
      return false;
    }
    
    const hasAccess = permissions.some(p => 
      p.widget_type === type && 
      p.widget_instance === instance && 
      p.is_enabled
    );
    
    console.log(`Checking permission for ${type}/${instance}: ${hasAccess}`);
    return hasAccess;
  }, [permissions]);

  const hasAnyNewsFeed = useCallback((): boolean => {
    return hasPermission('news', 'feed1') || hasPermission('news', 'feed2');
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyNewsFeed
  };
};
