import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api';
import type { PlanExercise, SessionExercise, WorkoutPlan, WorkoutSession } from '../api';
import { useAuth } from '../auth';

const createEmptyPlan = () => ({
  name: '',
  description: '',
  exercises: [
    {
      exerciseName: '',
      order: 1,
      sets: [{ setNumber: 1, targetReps: 8, targetWeight: 0 }],
    },
  ],
});

const createSessionFromPlan = (plan: WorkoutPlan): SessionExercise[] =>
  plan.exercises.map((exercise) => ({
    exerciseName: exercise.exerciseName,
    sets: exercise.sets.map((set) => ({
      setNumber: set.setNumber,
      actualReps: set.targetReps,
      actualWeight: set.targetWeight,
    })),
  }));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [planForm, setPlanForm] = useState<Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>>(createEmptyPlan());
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [sessionNote, setSessionNote] = useState('');
  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const plansResponse = await apiClient.getUserWorkoutPlans(user.id, { page: 1, pageSize: 20 });
        const sessionsResponse = await apiClient.getUserWorkoutSessions(user.id, { page: 1, pageSize: 20 });
        const availablePlans = plansResponse.data.items || [];
        setPlans(availablePlans);
        setSessions(sessionsResponse.data.items || []);
        if (availablePlans.length > 0) {
          setSelectedPlanId(availablePlans[0].id);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        setMessage('Unable to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId]
  );

  useEffect(() => {
    if (!selectedPlan) {
      setSessionExercises([]);
      return;
    }
    setSessionExercises(createSessionFromPlan(selectedPlan));
  }, [selectedPlan]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const plansResponse = await apiClient.getUserWorkoutPlans(user.id, { page: 1, pageSize: 20 });
      const sessionsResponse = await apiClient.getUserWorkoutSessions(user.id, { page: 1, pageSize: 20 });
      const availablePlans = plansResponse.data.items || [];
      setPlans(availablePlans);
      setSessions(sessionsResponse.data.items || []);
      if (availablePlans.length > 0) {
        setSelectedPlanId(availablePlans[0].id);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data', error);
      setMessage('Unable to refresh dashboard data.');
    }
  };

  const handlePlanFieldChange = (field: keyof typeof planForm, value: string) => {
    setPlanForm((current) => ({ ...current, [field]: value }));
  };

  const handleExerciseChange = (index: number, field: keyof PlanExercise, value: string | number) => {
    setPlanForm((current) => {
      const updated = [...current.exercises];
      updated[index] = { ...updated[index], [field]: value } as PlanExercise;
      return { ...current, exercises: updated };
    });
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof PlanExercise['sets'][0], value: number) => {
    setPlanForm((current) => {
      const updated = [...current.exercises];
      const exercise = { ...updated[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercise.sets = sets;
      updated[exerciseIndex] = exercise;
      return { ...current, exercises: updated };
    });
  };

  const addExercise = () => {
    setPlanForm((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          exerciseName: '',
          order: current.exercises.length + 1,
          sets: [{ setNumber: 1, targetReps: 8, targetWeight: 0 }],
        },
      ],
    }));
  };

  const addSet = (exerciseIndex: number) => {
    setPlanForm((current) => {
      const updated = [...current.exercises];
      const exercise = { ...updated[exerciseIndex] };
      exercise.sets = [
        ...exercise.sets,
        {
          setNumber: exercise.sets.length + 1,
          targetReps: 8,
          targetWeight: 0,
        },
      ];
      updated[exerciseIndex] = exercise;
      return { ...current, exercises: updated };
    });
  };

  const removeExercise = (index: number) => {
    setPlanForm((current) => {
      const updated = current.exercises.filter((_, idx) => idx !== index).map((exercise, idx) => ({
        ...exercise,
        order: idx + 1,
      }));
      return { ...current, exercises: updated };
    });
  };

  const handleCreateOrUpdatePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setMessage('');

    const payload = {
      ...planForm,
      userId: user.id,
    };

    try {
      if (editingPlanId) {
        await apiClient.updateWorkoutPlan(editingPlanId, payload);
        setMessage('Workout plan updated successfully.');
      } else {
        await apiClient.createWorkoutPlan(payload);
        setMessage('Workout plan created successfully.');
      }
      setPlanForm(createEmptyPlan());
      setEditingPlanId(null);
      await refreshData();
    } catch (error) {
      setMessage('Unable to save the workout plan.');
      console.error(error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Delete this plan?')) {
      return;
    }
    try {
      await apiClient.deleteWorkoutPlan(planId);
      setMessage('Workout plan deleted successfully.');
      await refreshData();
    } catch (error) {
      setMessage('Unable to delete the plan.');
      console.error(error);
    }
  };

  const handleEditPlan = (plan: WorkoutPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      exercises: plan.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        order: exercise.order,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          targetReps: set.targetReps,
          targetWeight: set.targetWeight,
        })),
      })),
    });
  };

  const handleSessionExerciseChange = (exerciseIndex: number, setIndex: number, field: keyof SessionExercise['sets'][0], value: number) => {
    setSessionExercises((current) => {
      const updated = [...current];
      const exercise = { ...updated[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercise.sets = sets;
      updated[exerciseIndex] = exercise;
      return updated;
    });
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedPlan) return;
    setMessage('');

    try {
      await apiClient.createWorkoutSession({
        userId: user.id,
        planId: selectedPlan.id,
        performedAt,
        notes: sessionNote,
        exercises: sessionExercises,
      });
      setMessage('Workout session created successfully.');
      setSessionNote('');
      await refreshData();
    } catch (error) {
      setMessage('Unable to create workout session.');
      console.error(error);
    }
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Need help from your AI coach?</h2>
            <p className="mt-1 text-sm text-slate-500">Ask about workouts, nutrition, recovery, or progress planning.</p>
          </div>
          <Link
            to="/coach"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open AI Coach
          </Link>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Workout plans</h2>
                <p className="mt-1 text-sm text-slate-500">Manage your saved plans and edit them in one place.</p>
              </div>
            </div>
            {loading ? (
              <p className="mt-6 text-slate-600">Loading plans…</p>
            ) : plans.length === 0 ? (
              <p className="mt-6 text-slate-600">No plans yet. Create your first workout plan below.</p>
            ) : (
              <div className="mt-6 grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                        <p className="mt-2 text-sm text-slate-600">{plan.description || 'No description added.'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPlan(plan)}
                          className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="rounded-2xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">Exercises: {plan.exercises.length}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{editingPlanId ? 'Edit workout plan' : 'Create workout plan'}</h2>
            <form className="mt-6 space-y-5" onSubmit={handleCreateOrUpdatePlan}>
              <label className="block text-sm font-medium text-slate-700">
                Plan name
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  value={planForm.name}
                  onChange={(e) => handlePlanFieldChange('name', e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  value={planForm.description}
                  onChange={(e) => handlePlanFieldChange('description', e.target.value)}
                  rows={3}
                />
              </label>

              <div className="space-y-4 rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Exercises</h3>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Add exercise
                  </button>
                </div>
                <div className="space-y-4">
                  {planForm.exercises.map((exercise, index) => (
                    <div key={index} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Exercise name
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                            value={exercise.exerciseName}
                            onChange={(e) => handleExerciseChange(index, 'exerciseName', e.target.value)}
                            required
                          />
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                          Order
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                            type="number"
                            min={1}
                            value={exercise.order}
                            onChange={(e) => handleExerciseChange(index, 'order', Number(e.target.value))}
                            required
                          />
                        </label>
                      </div>

                      <div className="space-y-3">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="grid gap-4 sm:grid-cols-3">
                            <label className="block text-sm font-medium text-slate-700">
                              Set #
                              <input
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                type="number"
                                min={1}
                                value={set.setNumber}
                                onChange={(e) => handleSetChange(index, setIndex, 'setNumber', Number(e.target.value))}
                                required
                              />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                              Reps
                              <input
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                type="number"
                                min={1}
                                value={set.targetReps}
                                onChange={(e) => handleSetChange(index, setIndex, 'targetReps', Number(e.target.value))}
                                required
                              />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                              Weight
                              <input
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                type="number"
                                min={0}
                                value={set.targetWeight}
                                onChange={(e) => handleSetChange(index, setIndex, 'targetWeight', Number(e.target.value))}
                                required
                              />
                            </label>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSet(index)}
                          className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          Add set
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Remove exercise
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {editingPlanId ? 'Update plan' : 'Create plan'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Create workout session</h2>
            <form className="mt-6 space-y-5" onSubmit={handleCreateSession}>
              <label className="block text-sm font-medium text-slate-700">
                Choose plan
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Performed at
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  type="datetime-local"
                  value={performedAt}
                  onChange={(e) => setPerformedAt(e.target.value)}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  rows={3}
                />
              </label>

              {selectedPlan && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-base font-semibold text-slate-900">Session details for {selectedPlan.name}</h3>
                  <div className="mt-4 space-y-4">
                    {sessionExercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-slate-900">{exercise.exerciseName}</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <label className="text-sm font-medium text-slate-700">Set #{set.setNumber}</label>
                              <label className="block text-sm text-slate-700">
                                Reps
                                <input
                                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                                  type="number"
                                  min={0}
                                  value={set.actualReps}
                                  onChange={(e) => handleSessionExerciseChange(exerciseIndex, setIndex, 'actualReps', Number(e.target.value))}
                                />
                              </label>
                              <label className="block text-sm text-slate-700">
                                Weight
                                <input
                                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                                  type="number"
                                  min={0}
                                  value={set.actualWeight}
                                  onChange={(e) => handleSessionExerciseChange(exerciseIndex, setIndex, 'actualWeight', Number(e.target.value))}
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create session
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Recent sessions</h2>
            {loading ? (
              <p className="mt-4 text-slate-600">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="mt-4 text-slate-600">No sessions yet. Create one from an existing plan.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {sessions.map((session) => {
                  const planName = plans.find((p) => p.id === session.planId)?.name || 'Unknown Plan';
                  return (
                    <div key={session.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">{session.performedAt.slice(0, 16).replace('T', ' ')}</h3>
                      <p className="mt-2 text-sm text-slate-600">{session.notes || 'No notes added.'}</p>
                      <p className="mt-3 text-sm text-slate-500">Plan: <span className="font-medium text-slate-700">{planName}</span></p>
                      <p className="mt-1 text-sm text-slate-500">Exercises: {session.exercises.length}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
