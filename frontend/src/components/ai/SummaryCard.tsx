import React from 'react';
import { Card } from 'flowbite-react';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface SummaryCardProps {
  summary: string;
  suggestedAction?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, suggestedAction }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <HiOutlineDocumentText className="text-blue-500 w-6 h-6" />
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          AI Summary
        </h5>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overview</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {summary || 'No summary available.'}
          </p>
        </div>
        
        {suggestedAction && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Suggested Action</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              {suggestedAction}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SummaryCard;
