import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import QuestionsPage from './pages/QuestionsPage';
import SummaryPage from './pages/SummaryPage';
import PaymentPage from './pages/PaymentPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
