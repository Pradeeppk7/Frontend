import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Users from './components/Users';
import WorkoutPlans from './components/WorkoutPlans';
import WorkoutSessions from './components/WorkoutSessions';
import CoachChat from './components/CoachChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>LiftLog</h1>
          <ul>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/workout-plans">Workout Plans</Link></li>
            <li><Link to="/workout-sessions">Workout Sessions</Link></li>
            <li><Link to="/coach-chat">AI Coach</Link></li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route path="/workout-plans" element={<WorkoutPlans />} />
            <Route path="/workout-sessions" element={<WorkoutSessions />} />
            <Route path="/coach-chat" element={<CoachChat />} />
            <Route path="/" element={<div>Welcome to LiftLog!</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;