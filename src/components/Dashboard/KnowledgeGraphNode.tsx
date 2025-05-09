
import React from 'react';
import { Handle, Position } from 'reactflow';
import { User, Building2, MapPin, Briefcase, Package } from 'lucide-react';

interface CustomNodeProps {
  data: any;
  isConnectable: boolean;
}

const nodeColors: Record<string, string> = {
  person: '#3b82f6', // Blue
  organization: '#10b981', // Green
  location: '#f59e0b', // Yellow
  operation: '#ef4444', // Red
  program: '#8b5cf6', // Purple
};

const nodeIcons: Record<string, React.ReactNode> = {
  person: <User size={16} />,
  organization: <Building2 size={16} />,
  location: <MapPin size={16} />,
  operation: <Briefcase size={16} />,
  program: <Package size={16} />,
};

const CustomNode: React.FC<CustomNodeProps> = ({ data, isConnectable }) => {
  const nodeType = data.type || 'default';
  const bgColor = nodeColors[nodeType] || '#64748b';
  const icon = nodeIcons[nodeType] || null;
  
  // Handle node click - this will call the onNodeClick handler from the parent
  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling up
    console.log('Node clicked in component:', data);
    
    // If there's an onClick handler provided in data, call it
    if (data.onClick) {
      data.onClick(event, { id: data.id, data, type: nodeType });
    }
  };
  
  return (
    <div className="group relative">
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="w-2 h-2 bg-gray-400 border-2 border-white" 
      />
      <div 
        className="flex items-center px-3 py-2 rounded-md border shadow-sm transition-shadow hover:shadow-md cursor-pointer" 
        style={{ backgroundColor: 'white', borderColor: bgColor, borderWidth: '2px' }}
        onClick={handleNodeClick}
      >
        <div className="flex items-center justify-center rounded-full p-1 mr-2" 
          style={{ backgroundColor: bgColor }}>
          <div className="text-white">{icon}</div>
        </div>
        <div className="text-sm font-medium truncate max-w-[120px]">
          {data.label}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-2 h-2 bg-gray-400 border-2 border-white" 
      />
    </div>
  );
};

export default CustomNode;
