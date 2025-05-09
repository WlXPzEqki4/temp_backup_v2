
import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkspaceSelectorProps {
  selectedWorkspace: string | 'all';
  setSelectedWorkspace: (workspace: string | 'all') => void;
  workspaces: string[];
  label?: string;
  className?: string;
  debugMode?: boolean;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  selectedWorkspace,
  setSelectedWorkspace,
  workspaces,
  label = "Workspace:",
  className = "",
  debugMode = false
}) => {
  // Sort workspaces alphabetically for better UX
  const sortedWorkspaces = [...workspaces].sort((a, b) => a.localeCompare(b));
  
  const handleWorkspaceChange = (value: string) => {
    console.log(`Workspace changed from "${selectedWorkspace}" to "${value}"`);
    setSelectedWorkspace(value as string | 'all');
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <label htmlFor="workspace" className="text-sm font-medium whitespace-nowrap">
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Select the workspace to filter the data. Each visualization can have its own workspace selection.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select
        value={selectedWorkspace}
        onValueChange={handleWorkspaceChange}
      >
        <SelectTrigger className="w-[180px] border-gray-300">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Workspaces ({workspaces.length})</SelectItem>
            {sortedWorkspaces.map((workspace) => (
              <SelectItem key={workspace} value={workspace}>
                {workspace}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {debugMode && (
        <span className="text-xs text-gray-500">
          Selected: "{selectedWorkspace}" ({workspaces.length} total)
        </span>
      )}
    </div>
  );
};

export default WorkspaceSelector;
