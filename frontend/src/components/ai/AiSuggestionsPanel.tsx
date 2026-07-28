// @ts-nocheck
import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import { HiOutlineLightBulb, HiCheck, HiX } from 'react-icons/hi';

interface AiSuggestionsPanelProps {
  complaintId: string;
  onAccept: (type: 'root_cause' | 'capa', data: any) => void;
}

const AiSuggestionsPanel: React.FC<AiSuggestionsPanelProps> = ({ complaintId, onAccept }) => {
  const [loading, setLoading] = useState(false);
  const [rootCause, setRootCause] = useState<any>(null);
  const [capa, setCapa] = useState<any>(null);

  const generateRootCause = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/complaints/${complaintId}/analyze/root-cause`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRootCause(data);
    } catch (e) {
      console.error("Failed to generate root cause", e);
    }
    setLoading(false);
  };

  const generateCAPA = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/complaints/${complaintId}/analyze/capa`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCapa(data);
    } catch (e) {
      console.error("Failed to generate CAPA", e);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border-indigo-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineLightBulb className="text-indigo-500 w-5 h-5" />
            AI Root Cause Analysis
          </h5>
          {!rootCause && (
            <Button size="xs" color="light" onClick={generateRootCause} isProcessing={loading}>
              Generate
            </Button>
          )}
        </div>
        
        {rootCause ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Suggested Root Cause:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{rootCause.root_cause}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confidence:</p>
                <Badge color={rootCause.confidence_score > 0.8 ? "success" : "warning"}>
                  {Math.round(rootCause.confidence_score * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-gray-500 italic mt-1">{rootCause.reasoning}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="xs" color="success" onClick={() => onAccept('root_cause', rootCause)}>
                <HiCheck className="mr-1" /> Accept
              </Button>
              <Button size="xs" color="failure" onClick={() => setRootCause(null)}>
                <HiX className="mr-1" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click generate to analyze the complaint and suggest a root cause.
          </p>
        )}
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 border-emerald-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineLightBulb className="text-emerald-500 w-5 h-5" />
            CAPA Recommendations
          </h5>
          {!capa && (
            <Button size="xs" color="light" onClick={generateCAPA} isProcessing={loading}>
              Generate
            </Button>
          )}
        </div>
        
        {capa ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Corrective Actions:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                {capa.corrective_actions.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Preventive Actions:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                {capa.preventive_actions.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="xs" color="success" onClick={() => onAccept('capa', capa)}>
                <HiCheck className="mr-1" /> Accept All
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate AI recommendations for immediate and long-term actions.
          </p>
        )}
      </Card>
    </div>
  );
};

export default AiSuggestionsPanel;
