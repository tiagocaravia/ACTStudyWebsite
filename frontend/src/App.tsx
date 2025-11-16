import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestionsPage from './pages/QuestionsPage';
import SummaryPage from './pages/SummaryPage';
import PaymentPage from './pages/PaymentPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
