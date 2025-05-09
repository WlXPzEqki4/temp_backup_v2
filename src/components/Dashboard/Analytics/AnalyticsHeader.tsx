
import React from 'react';
import WorkspaceSelector from './WorkspaceSelector';

interface AnalyticsHeaderProps {
  selectedWorkspace: string | 'all';
  setSelectedWorkspace: (workspace: string | 'all') => void;
  workspaces: string[];
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedWorkspace,
  setSelectedWorkspace,
  workspaces
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 className="text-xl font-semibold">MDM Analytics</h2>
        <p className="text-sm text-gray-500">
          Data visualization and analytics tools to help you understand trends and insights.
        </p>
      </div>
      <WorkspaceSelector 
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
        workspaces={workspaces}
      />
    </div>
  );
};

export default AnalyticsHeader;
