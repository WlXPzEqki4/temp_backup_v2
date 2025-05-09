
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, FileCheck, FileText, Download, ExternalLink } from 'lucide-react';

const ReportsTab: React.FC = () => {
  const reports = [
    {
      id: 1,
      title: 'Q1 Quarterly Analysis',
      description: 'Performance metrics and analysis for Q1 2025.',
      date: '2025-03-31',
      type: 'analytics',
      icon: FileBarChart
    },
    {
      id: 2,
      title: 'Monthly Activity Summary',
      description: 'Overview of key activities and metrics for April 2025.',
      date: '2025-04-30',
      type: 'summary',
      icon: FileCheck
    },
    {
      id: 3,
      title: 'Regional Impact Assessment',
      description: 'Analysis of regional performance and market trends.',
      date: '2025-05-05',
      type: 'report',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Reports Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">
          Access and manage all reports in one place. View, download, or share reports with your team.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <report.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-xs text-gray-500">{report.date}</span>
                </div>
                <CardTitle className="mt-3">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center text-xs text-gray-500 gap-2">
                  <span className="bg-slate-100 px-2 py-1 rounded-full">
                    {report.type === 'analytics' ? 'Analytics' : 
                     report.type === 'summary' ? 'Summary' : 'Report'}
                  </span>
                  <span>PDF • 2.4MB</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
