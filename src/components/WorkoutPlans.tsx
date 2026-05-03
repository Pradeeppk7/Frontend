import { useState, useEffect } from 'react';
import { apiClient } from '../api';
import type { WorkoutPlan } from '../api';

const WorkoutPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.getWorkoutPlans();
        setPlans(response.data.items || response.data);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Workout Plans</h2>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p>Exercises: {plan.exercises.length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutPlans;