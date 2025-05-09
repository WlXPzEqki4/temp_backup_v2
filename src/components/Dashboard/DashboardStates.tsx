
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const DashboardLoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading dashboard widgets..." 
}) => {
  return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      <p className="text-lg text-gray-500">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  error: unknown;
  refetch: () => void;
}

export const DashboardErrorState: React.FC<ErrorStateProps> = ({ error, refetch }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <p className="text-lg text-gray-500">Error loading widget permissions.</p>
      <button 
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        onClick={refetch}
      >
        Retry
      </button>
    </div>
  );
};

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export const DashboardEmptyState: React.FC<EmptyStateProps> = ({
  message = "No widget permissions found for your account.",
  subMessage = "Please contact an administrator to get access to widgets."
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <p className="text-lg text-gray-500">{message}</p>
      <p className="text-sm text-gray-400">{subMessage}</p>
    </div>
  );
};
