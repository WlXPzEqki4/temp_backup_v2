
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Globe, Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Network } from '@/hooks/use-knowledge-graph-networks';

interface KnowledgeGraphNetworkSelectorProps {
  networks: Network[];
  selectedNetwork: string;
  onNetworkChange: (networkId: string) => void;
  userClassificationLevel: string;
}

const KnowledgeGraphNetworkSelector: React.FC<KnowledgeGraphNetworkSelectorProps> = ({
  networks,
  selectedNetwork,
  onNetworkChange,
  userClassificationLevel
}) => {
  console.log("User classification level in selector:", userClassificationLevel);
  console.log("Available networks for selection:", networks);
  
  // Enhanced function to normalize classification strings more thoroughly
  const normalizeClassification = (classification: string): string => {
    if (!classification) return '';
    return classification
      .toLowerCase()
      .replace(/[_\s-]+/g, '') // Remove all underscores, spaces, and hyphens
      .trim();
  };

  // Function to render the classification icon
  const renderClassificationIcon = (classification: string) => {
    const normalizedClass = normalizeClassification(classification);
    
    if (normalizedClass === 'topsecret') {
      return <Lock className="h-4 w-4 text-red-500" />;
    } else if (normalizedClass === 'secret') {
      return <Shield className="h-4 w-4 text-amber-500" />;
    } else {
      return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  // Function to render the classification badge
  const renderClassificationBadge = (classification: string) => {
    const normalizedClass = normalizeClassification(classification);
    
    if (normalizedClass === 'topsecret') {
      return (
        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-300">
          Top Secret
        </Badge>
      );
    } else if (normalizedClass === 'secret') {
      return (
        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
          Secret
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
          Unclassified
        </Badge>
      );
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full mb-4">
      <label className="text-sm font-medium text-gray-700">Select Intelligence Network</label>
      <Select value={selectedNetwork} onValueChange={onNetworkChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center">
                <span className="mr-2">{renderClassificationIcon(network.classification)}</span>
                <span>{network.name}</span>
                {renderClassificationBadge(network.classification)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default KnowledgeGraphNetworkSelector;
