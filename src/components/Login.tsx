import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const Login = () => {
  const navigate = useNavigate();
  const { user, isReady, login, register } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerAge, setRegisterAge] = useState('');
  const [coachGoal, setCoachGoal] = useState('');
  const [coachDiet, setCoachDiet] = useState('');
  const [coachInjuries, setCoachInjuries] = useState('');
  const [coachExperience, setCoachExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      navigate('/dashboard');
    }
  }, [isReady, user, navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError('');

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setLoadingRegister(true);

    try {
      await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        ...(registerAge ? { age: parseInt(registerAge, 10) } : {}),
        coachProfile: {
          ...(coachGoal ? { goal: coachGoal } : {}),
          ...(coachDiet ? { dietaryPreferences: coachDiet } : {}),
          ...(coachInjuries ? { injuriesOrLimitations: coachInjuries } : {}),
          experienceLevel: coachExperience,
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoadingRegister(false);
    }
  };

  if (!isReady) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="text-center text-lg font-medium text-slate-700">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Account login</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-600">Sign in with your email and password.</p>
        </div>

        <form className="space-y-5 rounded-3xl bg-slate-50 p-6" onSubmit={handleLogin}>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-500"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="alex@example.com"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-500"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </div>

          {loginError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingLogin ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Register once, then the app keeps your session with a secure token.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder="Example: Alex"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="alex@example.com"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Age (optional)</label>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
              value={registerAge}
              onChange={(e) => setRegisterAge(e.target.value)}
              placeholder="25"
              min="13"
              max="120"
            />
          </div>

          <hr className="my-4 border-slate-200" />

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Coach Profile (optional)</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700">Fitness Goal</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={coachGoal}
                onChange={(e) => setCoachGoal(e.target.value)}
                placeholder="e.g., Build muscle, Lose weight, Improve endurance"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Dietary Preferences</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={coachDiet}
                onChange={(e) => setCoachDiet(e.target.value)}
                placeholder="e.g., High protein, Vegetarian, Low carb"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Injuries or Limitations</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={coachInjuries}
                onChange={(e) => setCoachInjuries(e.target.value)}
                placeholder="e.g., Lower back pain, Knee injury"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Experience Level</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                value={coachExperience}
                onChange={(e) => setCoachExperience(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {registerError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {registerError}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingRegister}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingRegister ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;
