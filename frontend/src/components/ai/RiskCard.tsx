import React from 'react';
import { Card, Badge, Tooltip } from 'flowbite-react';
import { HiShieldExclamation, HiInformationCircle } from 'react-icons/hi';

interface RiskCardProps {
  priority: string;
  category: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'failure';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'gray';
  }
};

const RiskCard: React.FC<RiskCardProps> = ({ priority, category }) => {
  return (
    <Card className="bg-gradient-to-br from-rose-50 to-white dark:from-gray-800 dark:to-gray-900 border-rose-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <HiShieldExclamation className="text-rose-500 w-6 h-6" />
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Risk Assessment
        </h5>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>Predicted Priority</span>
            <Tooltip content="AI prediction based on complaint severity and risk factors">
              <HiInformationCircle className="w-4 h-4" />
            </Tooltip>
          </div>
          <Badge color={getPriorityColor(priority)} size="sm" className="uppercase font-semibold">
            {priority}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>Predicted Category</span>
            <Tooltip content="AI classification of the complaint type">
              <HiInformationCircle className="w-4 h-4" />
            </Tooltip>
          </div>
          <Badge color="purple" size="sm" className="uppercase font-semibold">
            {category.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default RiskCard;
