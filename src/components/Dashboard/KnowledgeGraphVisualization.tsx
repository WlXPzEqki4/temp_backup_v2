
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNodesState, useEdgesState, MarkerType } from 'reactflow';
import { useQuery } from '@tanstack/react-query';
import { getNodes, getEdges } from '@/hooks/use-knowledge-graph';
import { toast } from '@/hooks/use-toast';
import KnowledgeGraphFlow from '@/components/Dashboard/KnowledgeGraphFlow';
import KnowledgeGraphNodeDetails from '@/components/Dashboard/KnowledgeGraphNodeDetails';

interface KnowledgeGraphVisualizationProps {
  selectedNetwork: string;
  formatNodeProperties: (properties: any) => Array<{key: string, value: any}>;
}

const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({ 
  selectedNetwork,
  formatNodeProperties
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Query for nodes with network filter
  const { data: nodeData, isLoading: nodesLoading, error: nodesError } = useQuery({
    queryKey: ['knowledge-graph-nodes', selectedNetwork],
    queryFn: () => getNodes(selectedNetwork),
    enabled: !!selectedNetwork
  });

  if (nodesError) {
    console.error("Error fetching nodes:", nodesError);
  }

  // Query for edges with network filter
  const { data: edgeData, isLoading: edgesLoading, error: edgesError } = useQuery({
    queryKey: ['knowledge-graph-edges', selectedNetwork],
    queryFn: () => getEdges(selectedNetwork),
    enabled: !!selectedNetwork
  });

  if (edgesError) {
    console.error("Error fetching edges:", edgesError);
  }

  useEffect(() => {
    if (nodeData && edgeData) {
      console.log("Node data:", nodeData);
      console.log("Edge data:", edgeData);
      
      // Process nodes to add position and colors based on type
      const processedNodes = nodeData.map((node: any, index: number) => {
        // Arrange nodes in a circle layout
        const angle = (index * 2 * Math.PI) / nodeData.length;
        const radius = 300;
        const x = radius * Math.cos(angle) + 400;
        const y = radius * Math.sin(angle) + 300;

        // Return the node with position and styling
        return {
          id: node.id,
          type: node.type,
          position: { x, y },
          data: { 
            ...node,
            label: node.title,
            // Pass the onNodeClick handler to the node component through data prop
            onClick: onNodeClick,
            id: node.id
          }
        };
      });

      // Process edges to add styling
      const processedEdges = edgeData.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        data: edge.properties,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },
        style: { stroke: '#888' }
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
    }
  }, [nodeData, edgeData, setNodes, setEdges]);

  // Enhanced node click handler with explicit debugging
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event propagation to prevent bubbling
    console.log("Node clicked:", node);
    console.log("Node data:", node.data);
    setSelectedNode(node);
    toast({
      title: "Node selected",
      description: `Selected ${node.data?.label || 'node'}`,
      variant: "default",
    });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const resetSearch = () => {
    setSearchTerm('');
  };

  const closeNodeDetails = () => {
    setSelectedNode(null);
  };

  const isLoading = nodesLoading || edgesLoading;

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white w-full h-full" ref={reactFlowWrapper}>
        <KnowledgeGraphFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          resetSearch={resetSearch}
          isLoading={isLoading}
        />
      </div>

      <KnowledgeGraphNodeDetails
        selectedNode={selectedNode}
        formatNodeProperties={formatNodeProperties}
        nodes={nodes}
        edges={edges}
        onClose={closeNodeDetails}
      />
    </>
  );
};

export default KnowledgeGraphVisualization;
