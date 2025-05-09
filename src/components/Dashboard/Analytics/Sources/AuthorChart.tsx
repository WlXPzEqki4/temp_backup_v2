
import React, { useState, useEffect, useMemo } from 'react';
import BarChart from '../../Charts/BarChart';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import WorkspaceSelector from '../WorkspaceSelector';

interface AuthorChartProps {
  allAuthors: any[];
  workspaces: string[];
}

const AuthorChart: React.FC<AuthorChartProps> = ({ 
  allAuthors, 
  workspaces 
}) => {
  const [authorsWorkspace, setAuthorsWorkspace] = useState<string | 'all'>("all");
  const [authorsLoading, setAuthorsLoading] = useState<boolean>(false);
  
  // Debug information
  useEffect(() => {
    console.log('All authors data:', allAuthors);
    console.log('Selected authors workspace:', authorsWorkspace);
  }, [allAuthors, authorsWorkspace]);
  
  // Add loading state when workspace changes
  useEffect(() => {
    setAuthorsLoading(true);
    const timer = setTimeout(() => setAuthorsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [authorsWorkspace]);
  
  // Filter data based on selected workspaces using useMemo for optimization
  const filteredAuthors = useMemo(() => {
    if (authorsWorkspace === 'all') {
      return allAuthors;
    }
    
    // Use case-insensitive comparison for workspace filtering
    const filtered = allAuthors.filter(item => {
      const itemWorkspace = item.Workspace?.toString().trim() || "";
      const selectedWorkspace = authorsWorkspace?.toString().trim() || "";
      
      const isMatch = itemWorkspace.toLowerCase() === selectedWorkspace.toLowerCase();
      
      // Debug each item check
      console.log(`Author item check - Item workspace: "${itemWorkspace}", Selected: "${selectedWorkspace}", Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Filtered authors: Found ${filtered.length} items for workspace "${authorsWorkspace}"`);
    return filtered;
  }, [allAuthors, authorsWorkspace]);
  
  // Sort and prepare data for display
  const authorsToDisplay = useMemo(() => {
    if (authorsLoading) {
      return [{ Author: "Loading...", Mentions: 0 }];
    }
    
    if (filteredAuthors && filteredAuthors.length > 0) {
      // Sort by Mentions in descending order and take top 10
      return [...filteredAuthors]
        .sort((a, b) => (b.Mentions || 0) - (a.Mentions || 0))
        .slice(0, 10)
        .map(item => ({
          ...item,
          // Truncate long author names for better display
          Author: item.Author?.length > 30 ? `${item.Author.substring(0, 27)}...` : item.Author
        }));
    }
    
    return [{ Author: "No data available", Mentions: 0 }];
  }, [filteredAuthors, authorsLoading]);
  
  // Check if we have actual data
  const hasAuthorData = !authorsLoading && filteredAuthors && filteredAuthors.length > 0;

  return (
    <Card className={`shadow-sm ${!hasAuthorData ? "border-yellow-200" : ""}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Top Authors</h3>
        <WorkspaceSelector
          selectedWorkspace={authorsWorkspace}
          setSelectedWorkspace={setAuthorsWorkspace}
          workspaces={workspaces}
          className="ml-auto"
        />
      </CardHeader>
      <CardContent className="p-4 flex flex-col">
        {!hasAuthorData && (
          <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-50 text-yellow-800 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">
              No author data available for "{authorsWorkspace}" workspace
              ({filteredAuthors.length} authors found in all workspaces)
            </span>
          </div>
        )}
        <div className="w-full h-[450px]"> 
          <BarChart 
            data={authorsToDisplay}
            xDataKey="Author"
            bars={[
              { dataKey: "Mentions", name: "Mentions", color: "#7E69AB" }
            ]}
            title=""
            layout="horizontal"
            height={450}
            className="authors-chart w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorChart;
