
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const AnalyticsLoading: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">MDM Analytics</h2>
          <p className="text-sm text-gray-500 mb-6">
            Data visualization and analytics tools to help you understand trends and insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsLoading;
