// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation'; // We will create this in a later phase
import { theme } from './utils/constants/theme';

// --- Placeholder Components (to be replaced later) ---
const Placeholder = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1 style={{ color: theme.primary }}>{title}</h1>
    <p style={{ color: theme.primary, opacity: 0.7 }}>This component will be built in a future phase.</p>
  </div>
);

const Home = () => <Placeholder title="Home Page" />;
const Analytics = () => <Placeholder title="Analytics Hub" />;
const Validation = () => <Placeholder title="Validation Methods" />;
const Frameworks = () => <Placeholder title="Security Frameworks" />;
const Simulations = () => <Placeholder title="Interactive Simulations" />;
const Intelligence = () => <Placeholder title="Threat Intelligence" />;
// --- End of Placeholder Components ---

function App() {
  const [activeSection, setActiveSection] = useState('home');

  // We will create a real Navigation component later. For now, this is a placeholder.
  const MockNavigation = () => (
    <nav style={{ background: theme.dark, padding: '1rem', color: theme.cream }}>
      <h1 style={{ textAlign: 'center' }}>DDoS Analytics Hub (Navigation Placeholder)</h1>
    </nav>
  );

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      background: theme.light
    }}>
      <MockNavigation /> {/* Placeholder until Navigation component is built */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/intelligence" element={<Intelligence />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;