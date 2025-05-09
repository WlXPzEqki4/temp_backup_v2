
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import NarrativesTable from '@/components/Dashboard/Charts/NarrativesTable';

const Analytics2Tab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500">
              View and analyze data across different workspaces with individual controls for each visualization
            </p>
          </div>
          
          <NarrativesTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics2Tab;
