import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWidgetPermissions } from '@/hooks/use-widget-permissions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GroupedPermission {
  widget_type: string;
  widget_instances: string[];
}

const UserPermissionsDisplay = ({ username }: { username: string }) => {
  console.log('UserPermissionsDisplay rendering for username:', username);
  
  const { data: rawPermissions, isLoading: permissionsLoading, error: permissionsError } = useWidgetPermissions(username);

  const widgetPermissions = React.useMemo(() => {
    if (!rawPermissions || rawPermissions.length === 0) {
      console.log('No permissions found or permissions array is empty');
      return [];
    }

    const uniquePermissions = rawPermissions.filter((permission, index, self) => 
      index === self.findIndex(p => 
        p.widget_type === permission.widget_type && 
        p.widget_instance === permission.widget_instance &&
        p.is_enabled === permission.is_enabled
      )
    );
    
    console.log('After deduplication:', uniquePermissions.length, 'unique permissions');
    
    const groupedPermissions: { [key: string]: string[] } = {};
    
    uniquePermissions.forEach((permission) => {
      if (!permission.is_enabled) {
        console.log(`Skipping disabled permission for ${permission.widget_type}/${permission.widget_instance}`);
        return;
      }
      
      if (!groupedPermissions[permission.widget_type]) {
        groupedPermissions[permission.widget_type] = [];
      }
      
      let instanceName = permission.widget_instance;
      if (permission.widget_type === 'weather') {
        // Map database keys to display names for weather widgets
        if (instanceName === 'abu_dhabi') instanceName = 'Khartoum';
        if (instanceName === 'dubai') instanceName = 'Omdurman';
      } else if (permission.widget_type === 'news') {
        if (instanceName === 'feed1') instanceName = 'Breaking News';
        if (instanceName === 'feed2') instanceName = 'UAE News';
      }
      
      if (!groupedPermissions[permission.widget_type].includes(instanceName)) {
        groupedPermissions[permission.widget_type].push(instanceName);
      }
    });
    
    console.log('Grouped permissions:', groupedPermissions);

    return Object.entries(groupedPermissions).map(([type, instances], index) => ({
      id: `${type}-${index}`,
      widget_type: type === 'rss' ? 'RSS' : type.charAt(0).toUpperCase() + type.slice(1),
      widget_instances: instances
    })) as (GroupedPermission & { id: string })[];
  }, [rawPermissions]);

  const { data: userAccess, isLoading: accessLoading, error: accessError } = useQuery({
    queryKey: ['user-access', username],
    queryFn: async () => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('user_access')
        .select('classification_levels, releasability_levels, can_disseminate_orcon')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching user access:', error);
        throw error;
      }
      
      console.log('User access data:', data);
      return data;
    },
    enabled: !!username,
    staleTime: 0,
    refetchOnMount: true
  });

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 p-2">
        <Loader2 className="animate-spin h-4 w-4" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Error loading permissions data.
        </AlertDescription>
      </Alert>
    );
  }

  if (!userAccess) {
    return (
      <div className="text-sm text-gray-500 p-2">No user access data available</div>
    );
  }

  const formattedClassificationLevels = userAccess.classification_levels
    .split(',')
    .map(level => level.trim())
    .join('\n');

  const formattedReleasabilityLevels = userAccess.releasability_levels
    .split(',')
    .map(level => level.trim())
    .join('\n');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Classification Levels</h4>
        <div className="space-y-2">
          {formattedClassificationLevels.split('\n').map((level, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="w-full py-1 justify-start bg-blue-50/50 hover:bg-blue-50/50 text-xs font-medium"
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Releasability Levels</h4>
        <div className="space-y-2">
          {formattedReleasabilityLevels.split('\n').map((level, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="w-full py-1 justify-start bg-green-50/50 hover:bg-green-50/50 text-xs font-medium"
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      {widgetPermissions && widgetPermissions.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Widget Access</h4>
            <div className="space-y-4">
              {widgetPermissions.map((permission) => (
                <div key={permission.id}>
                  <p className="text-xs text-gray-600 mb-2">
                    {permission.widget_type}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {permission.widget_instances.map((instance, idx) => (
                      <Badge 
                        key={`${permission.id}-${idx}`} 
                        variant="outline" 
                        className="bg-orange-50/50 hover:bg-orange-50/50 py-1 px-2 text-xs font-medium"
                      >
                        {instance}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserPermissionsDisplay;
