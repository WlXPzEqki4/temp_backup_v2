
import React from 'react';
import 'reactflow/dist/style.css';
import { useKnowledgeGraphFormatter } from '@/hooks/use-knowledge-graph-formatter';
import { useKnowledgeGraphNetworks, useNetworkClassification } from '@/hooks/use-knowledge-graph-networks';
import KnowledgeGraphNetworkSelector from '@/components/Dashboard/KnowledgeGraphNetworkSelector';
import KnowledgeGraphVisualization from '@/components/Dashboard/KnowledgeGraphVisualization';

interface KnowledgeGraphTabProps {
  userClassificationLevel?: string;
}

const KnowledgeGraphTab: React.FC<KnowledgeGraphTabProps> = ({ userClassificationLevel = 'unclassified' }) => {
  const { formatNodeProperties, normalizeClassification } = useKnowledgeGraphFormatter();
  const { networks, selectedNetwork, handleNetworkChange, networksLoading } = useKnowledgeGraphNetworks(userClassificationLevel);
  const { canAccessNetwork } = useNetworkClassification();

  console.log("KnowledgeGraphTab - User classification level:", userClassificationLevel);
  
  // Normalize the user classification level to ensure consistent handling
  const normalizedUserClassification = normalizeClassification(userClassificationLevel);
  console.log("Normalized user classification:", normalizedUserClassification);

  // Filter networks based on user classification level
  const availableNetworks = networks.filter(network => {
    const hasAccess = canAccessNetwork(network.classification, userClassificationLevel);
    console.log(`Network "${network.name}" (${network.classification}): User ${hasAccess ? 'has' : 'does not have'} access`);
    return hasAccess;
  });
  
  console.log("Available networks after filtering:", availableNetworks);

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
      {/* Network Selector */}
      <KnowledgeGraphNetworkSelector 
        networks={availableNetworks}
        selectedNetwork={selectedNetwork}
        onNetworkChange={handleNetworkChange}
        userClassificationLevel={userClassificationLevel}
      />

      {/* Knowledge Graph Visualization */}
      <KnowledgeGraphVisualization 
        selectedNetwork={selectedNetwork}
        formatNodeProperties={formatNodeProperties}
      />
    </div>
  );
};

export default KnowledgeGraphTab;
