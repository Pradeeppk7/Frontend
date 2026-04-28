import { useState, useEffect } from 'react';
import { apiClient } from '../api';

const WorkoutSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiClient.getWorkoutSessions();
        setSessions(response.data.items || response.data);
      } catch (error) {
        console.error('Error fetching workout sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Workout Sessions</h2>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            <p>Session ID: {session.id}</p>
            {/* Add more fields */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutSessions;