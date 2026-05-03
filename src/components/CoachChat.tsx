import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../api';
import type { CoachChatMessage } from '../api';
import { useAuth } from '../auth';

const CoachChat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ user: string; ai: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    setError('');
    setLoading(true);

    try {
      const history: CoachChatMessage[] = chat.flatMap((entry) => [
        { role: 'user', content: entry.user },
        { role: 'assistant', content: entry.ai },
      ]);

      const response = await apiClient.coachChat({
        message: trimmedMessage,
        userId: user?.id,
        history,
        profile: user?.coachProfile,
      });

      setChat((prev) => [...prev, { user: trimmedMessage, ai: response.data.reply }]);
      setMessage('');
    } catch (err) {
      console.error('Error chatting with coach:', err);
      setError('Unable to get a response from the coach. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <p className="text-sm text-slate-500">AI coach assistant</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Talk to your coach</h1>
        <p className="mt-2 text-slate-600">
          Ask fitness, recovery, workout, or nutrition questions and get practical guidance.
        </p>
      </div>

      {user?.coachProfile && (Object.values(user.coachProfile).some(v => v) || user.coachProfile.experienceLevel) && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600 mb-3">Your Profile</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {user.coachProfile.goal && (
              <div>
                <span className="font-medium text-slate-700">Goal:</span>
                <span className="text-slate-600"> {user.coachProfile.goal}</span>
              </div>
            )}
            {user.coachProfile.experienceLevel && (
              <div>
                <span className="font-medium text-slate-700">Experience:</span>
                <span className="text-slate-600 capitalize"> {user.coachProfile.experienceLevel}</span>
              </div>
            )}
            {user.coachProfile.dietaryPreferences && (
              <div>
                <span className="font-medium text-slate-700">Diet:</span>
                <span className="text-slate-600"> {user.coachProfile.dietaryPreferences}</span>
              </div>
            )}
            {user.coachProfile.injuriesOrLimitations && (
              <div>
                <span className="font-medium text-slate-700">Limitations:</span>
                <span className="text-slate-600"> {user.coachProfile.injuriesOrLimitations}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="space-y-4">
          {chat.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
              Send a message to begin your chat with the coach.
            </div>
          ) : (
            chat.map((msg, idx) => (
              <div key={idx} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">You</div>
                  <div className="mt-2 text-slate-900">{msg.user}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Coach</div>
                  <div className="mt-2 whitespace-pre-line text-slate-900">{msg.ai}</div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:flex sm:items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the coach..."
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default CoachChat;
