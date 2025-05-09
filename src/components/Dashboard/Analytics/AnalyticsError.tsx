
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsErrorProps {
  error: Error;
}

const AnalyticsError: React.FC<AnalyticsErrorProps> = ({ error }) => {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">MDM Analytics</h2>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <h3 className="font-medium">Error loading analytics data</h3>
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsError;
