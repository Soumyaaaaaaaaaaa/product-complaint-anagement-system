import React from 'react';
import { Tooltip } from 'flowbite-react';
import { HiCheckCircle, HiExclamationCircle, HiXCircle } from 'react-icons/hi';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 to 1.0
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  
  let Icon = HiExclamationCircle;
  let colorClass = 'text-yellow-500';
  let message = 'Moderate Confidence';

  if (confidence >= 0.85) {
    Icon = HiCheckCircle;
    colorClass = 'text-green-500';
    message = 'High Confidence';
  } else if (confidence < 0.5) {
    Icon = HiXCircle;
    colorClass = 'text-red-500';
    message = 'Low Confidence';
  }

  return (
    <Tooltip content={`${message}: AI is ${percentage}% confident in this extracted value.`}>
      <div className="flex items-center gap-1 cursor-help">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <span className={`text-xs font-medium ${colorClass}`}>{percentage}%</span>
      </div>
    </Tooltip>
  );
};

export default ConfidenceIndicator;
