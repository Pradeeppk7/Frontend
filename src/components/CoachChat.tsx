import { useState } from 'react';
import { apiClient } from '../api';

const CoachChat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ user: string; ai: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const response = await apiClient.coachChat({ message });
      setChat([...chat, { user: message, ai: response.data.response }]);
      setMessage('');
    } catch (error) {
      console.error('Error chatting with coach:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>AI Coach Chat</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {chat.map((msg, idx) => (
          <div key={idx}>
            <strong>You:</strong> {msg.user}<br />
            <strong>Coach:</strong> {msg.ai}<br /><br />
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Ask the coach..."
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};

export default CoachChat;