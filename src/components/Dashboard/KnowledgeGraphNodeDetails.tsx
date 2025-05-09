
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface KnowledgeGraphNodeDetailsProps {
  selectedNode: any | null;
  formatNodeProperties: (properties: any) => Array<{key: string, value: any}>;
  nodes: any[];
  edges: any[];
  onClose: () => void;
}

const KnowledgeGraphNodeDetails: React.FC<KnowledgeGraphNodeDetailsProps> = ({
  selectedNode,
  formatNodeProperties,
  nodes,
  edges,
  onClose
}) => {
  if (!selectedNode) return null;

  return (
    <Sheet open={!!selectedNode} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-[400px]">
        <SheetHeader className="pb-4">
          <SheetTitle>{selectedNode?.data?.label}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 capitalize">
                {selectedNode.type}
              </Badge>
              <p className="text-sm text-gray-600">{selectedNode.data.description}</p>
            </div>

            {selectedNode.data.image_url && (
              <img 
                src={selectedNode.data.image_url} 
                alt={selectedNode.data.label}
                className="w-full h-auto rounded-md object-cover my-2" 
              />
            )}

            <div>
              <h4 className="font-medium text-sm mb-1">Properties</h4>
              <Separator className="mb-2" />
              <div className="space-y-2">
                {formatNodeProperties(selectedNode.data.properties).map(({ key, value }) => (
                  <div key={key} className="grid grid-cols-3 text-sm">
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="col-span-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add null check before accessing tags */}
            {selectedNode.data.tags && Array.isArray(selectedNode.data.tags) && selectedNode.data.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-1">Tags</h4>
                <Separator className="mb-2" />
                <div className="flex flex-wrap gap-1">
                  {selectedNode.data.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm mb-1">Connections</h4>
              <Separator className="mb-2" />
              <div className="space-y-2">
                {edges
                  .filter((edge: any) => edge.source === selectedNode.id || edge.target === selectedNode.id)
                  .map((edge: any) => {
                    const isSource = edge.source === selectedNode.id;
                    const connectedNodeId = isSource ? edge.target : edge.source;
                    const connectedNode = nodes.find((node) => node.id === connectedNodeId);
                    
                    return (
                      <div key={edge.id} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-gray-500">
                            {isSource ? 'Connected to: ' : 'Connected from: '}
                          </span>
                          <span className="font-medium ml-1">
                            {connectedNode?.data.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 italic mt-1">
                          Relationship: {edge.label}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default KnowledgeGraphNodeDetails;
