// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, Timeline, Spinner } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';

interface TimelineEvent {
  timestamp: string;
  action: string;
  details: string;
}

interface AiTimelineProps {
  complaintId: string;
}

const AiTimeline: React.FC<AiTimelineProps> = ({ complaintId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/v1/complaints/${complaintId}/ai-timeline`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (e) {
        console.error("Failed to load timeline", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [complaintId]);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        AI Analysis Timeline
      </h5>
      
      {loading ? (
        <div className="flex justify-center p-4"><Spinner /></div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500">No AI actions recorded yet.</p>
      ) : (
        <Timeline>
          {events.map((event, idx) => (
            <Timeline.Item key={idx}>
              <Timeline.Point icon={HiCalendar} />
              <Timeline.Content>
                <Timeline.Time>{new Date(event.timestamp).toLocaleString()}</Timeline.Time>
                <Timeline.Title className="text-base">{event.action}</Timeline.Title>
                <Timeline.Body className="text-sm">
                  {event.details}
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Card>
  );
};

export default AiTimeline;
