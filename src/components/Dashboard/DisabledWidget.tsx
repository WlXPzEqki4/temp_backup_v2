
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisabledWidgetProps {
  title: string;
  className?: string;
}

const DisabledWidget: React.FC<DisabledWidgetProps> = ({ title, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this widget.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DisabledWidget;
