import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNetworks } from '@/hooks/use-knowledge-graph';
import { toast } from '@/hooks/use-toast';

export interface Network {
  id: string;
  name: string;
  classification: string;
  description?: string;
}

export function useKnowledgeGraphNetworks(userClassificationLevel: string = 'unclassified') {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('default');
  const { normalizeClassification } = useNetworkClassification();
  
  const normalizedUserClassification = normalizeClassification(userClassificationLevel);
  console.log("Normalized user classification:", normalizedUserClassification);

  // Query for available networks
  const { data: networksData, isLoading: networksLoading, error: networksError } = useQuery({
    queryKey: ['knowledge-graph-networks'],
    queryFn: getNetworks
  });

  if (networksError) {
    console.error("Error fetching networks:", networksError);
  }

  // Default networks if we can't fetch from database yet
  const networks: Network[] = useMemo(() => {
    if (networksData) {
      console.log("Networks data from DB:", networksData);
      return networksData;
    }
    return [
      { id: 'default', name: 'Angola Intelligence Network', classification: 'unclassified' },
      { id: 'network-2', name: 'HUMINT Collection Network', classification: 'secret' },
      { id: 'network-3', name: 'Critical Infrastructure Network', classification: 'secret' },
      { id: 'network-4', name: 'Special Operations Network', classification: 'top_secret' }
    ];
  }, [networksData]);

  console.log("Current networks:", networks);

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId);
    toast({
      title: "Network changed",
      description: `Switched to ${networks.find(n => n.id === networkId)?.name}`,
      variant: "default",
    });
  };

  return {
    networks,
    selectedNetwork,
    setSelectedNetwork,
    handleNetworkChange,
    networksLoading,
    networksError
  };
}

// Network classification helper functions
export function useNetworkClassification() {
  // Enhanced function to normalize classification strings more thoroughly
  const normalizeClassification = (classification: string): string => {
    if (!classification) return '';
    return classification
      .toLowerCase()
      .replace(/[_\s-]+/g, '') // Remove all underscores, spaces, and hyphens
      .trim();
  };

  // Improved function to check if a user can access a network based on their classification level
  const canAccessNetwork = (networkClassification: string, userLevel: string): boolean => {
    // Normalize both classifications
    const normalizedNetworkClass = normalizeClassification(networkClassification);
    const normalizedUserLevel = normalizeClassification(userLevel);
    
    console.log(`Comparing access: Network (${networkClassification} -> ${normalizedNetworkClass}) vs User (${userLevel} -> ${normalizedUserLevel})`);
    
    // If user is top secret, they can access everything
    if (normalizedUserLevel === 'topsecret') {
      console.log("User has top secret clearance, granting access");
      return true;
    }
    
    // If network is top secret, only top secret users can access it
    if (normalizedNetworkClass === 'topsecret') {
      const canAccess = normalizedUserLevel === 'topsecret';
      console.log(`Network is top secret, user ${canAccess ? 'can' : 'cannot'} access`);
      return canAccess;
    }
    
    // If user is secret, they can access secret and unclassified
    if (normalizedUserLevel === 'secret') {
      const canAccess = normalizedNetworkClass !== 'topsecret';
      console.log(`User is secret, ${canAccess ? 'can' : 'cannot'} access ${normalizedNetworkClass}`);
      return canAccess;
    }
    
    // Otherwise, user can only access unclassified
    const canAccess = normalizedNetworkClass === 'unclassified';
    console.log(`User is unclassified, ${canAccess ? 'can' : 'cannot'} access ${normalizedNetworkClass}`);
    return canAccess;
  };

  return {
    normalizeClassification,
    canAccessNetwork
  };
}
