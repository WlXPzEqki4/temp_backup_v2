import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WidgetPermission {
  id: string;
  widget_type: 'weather' | 'crypto' | 'rss' | 'news';
  widget_instance: string;
  is_enabled: boolean;
  username: string;
  created_at?: string | null;
}

export function useWidgetPermissions(username: string) {
  return useQuery({
    queryKey: ['widget-permissions', username],
    queryFn: async () => {
      if (!username || username.trim() === '') {
        console.error('No username provided to useWidgetPermissions hook');
        return [];
      }

      console.log('Fetching widget permissions for user:', username);
      
      const { data, error } = await supabase
        .from('widget_permissions')
        .select('*')
        .eq('username', username);

      if (error) {
        console.error('Error fetching widget permissions:', error);
        toast({
          title: 'Error fetching permissions',
          description: 'Unable to load your widget permissions. Please try again later.',
          variant: 'destructive'
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.log(`No widget permissions found for user: ${username}`);
        return [];
      } 
      
      console.log('Fetched widget permissions:', data.length, 'permissions found');
      
      // Filter out duplicates - keep only unique widget_type + widget_instance combinations
      const uniquePermissions = data.filter((permission, index, self) => 
        index === self.findIndex(p => 
          p.widget_type === permission.widget_type && 
          p.widget_instance === permission.widget_instance &&
          p.is_enabled === permission.is_enabled
        )
      );
      
      console.log('After deduplication:', uniquePermissions.length, 'unique permissions');
      return uniquePermissions as WidgetPermission[];
    },
    enabled: !!username && username.trim() !== '',
    staleTime: 0, // Don't cache permissions
    refetchOnMount: true, // Always refetch when component mounts
    retry: 2, // Retry twice on failure
  });
}
