
import React from 'react';
import DomainChart from './Sources/DomainChart';
import AuthorChart from './Sources/AuthorChart';

interface TopSourcesSectionProps {
  allDomains: any[];
  allAuthors: any[];
  workspaces: string[];
}

const TopSourcesSection: React.FC<TopSourcesSectionProps> = ({ 
  allDomains, 
  allAuthors, 
  workspaces 
}) => {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6">
      <DomainChart allDomains={allDomains} workspaces={workspaces} />
      <AuthorChart allAuthors={allAuthors} workspaces={workspaces} />
    </div>
  );
};

export default TopSourcesSection;
