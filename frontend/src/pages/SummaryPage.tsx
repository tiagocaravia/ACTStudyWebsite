import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgressDashboard from '../components/ProgressDashboard';
import './SummaryPage.css';

interface Analytics {
  user_id: number;
  total_answered: number;
  total_correct: number;
  overall_accuracy: number;
  by_subject: {
    [key: string]: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
  weak_areas: Array<{
    subject: string;
    accuracy: number;
    total_attempted: number;
    priority: string;
  }>;
}

interface AIFeedback {
  feedback: string;
  recommendations: string[];
  analytics_summary: {
    overall_accuracy: number;
    total_answered: number;
    weak_areas_count: number;
  };
  ai_generated: boolean;
}

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'https://actstudywebsite.onrender.com';

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch analytics
      const analyticsRes = await fetch(`${API_URL}/api/analytics/${user.id}`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch AI feedback
      const feedbackRes = await fetch(`${API_URL}/api/ai-feedback/${user.id}`);
      const feedbackData = await feedbackRes.json();
      setAiFeedback(feedbackData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: {[key: string]: string} = {
      math: '#61dafb',
      english: '#f39c12',
      reading: '#9b59b6',
      science: '#2ecc71'
    };
    return colors[subject] || '#61dafb';
  };

  if (!user) {
    return (
      <div className="summary-page">
        <div className="no-user">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your summary.</p>
          <button onClick={() => navigate('/login')} className="cta-button">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="summary-page">
        <div className="loading">Loading your summary...</div>
      </div>
    );
  }

  if (!analytics || analytics.total_answered === 0) {
    return (
      <div className="summary-page">
        <div className="no-data">
          <h2>No Practice Data Yet</h2>
          <p>Start answering questions to see your summary and areas to work on.</p>
          <button onClick={() => navigate('/questions')} className="cta-button">
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-page">
      <div className="summary-header">
        <h1>Your ACT Prep Summary</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/questions')} className="practice-button">
            Continue Practicing
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <section className="overall-stats">
        <div className="stat-card primary">
          <div className="stat-label">Total Questions</div>
          <div className="stat-value">{analytics.total_answered}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Correct Answers</div>
          <div className="stat-value">{analytics.total_correct}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-label">Overall Accuracy</div>
          <div className="stat-value">{analytics.overall_accuracy.toFixed(1)}%</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Areas to Improve</div>
          <div className="stat-value">{analytics.weak_areas.length}</div>
        </div>
      </section>

      {/* Progress Dashboard */}
      <section className="dashboard-section">
        <ProgressDashboard userId={user.id} API_URL={API_URL} />
      </section>

      {/* Completed Questions Summary */}
      <section className="completed-questions">
        <h2>Performance by Subject</h2>
        <div className="subject-performance">
          {Object.entries(analytics.by_subject).map(([subject, stats]) => (
            <div key={subject} className="subject-card" style={{ borderLeftColor: getSubjectColor(subject) }}>
              <div className="subject-header">
                <h3 style={{ color: getSubjectColor(subject) }}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </h3>
                <div className="subject-accuracy">
                  {stats.accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="subject-stats">
                <div className="stat-item">
                  <span className="stat-label-small">Answered:</span>
                  <span className="stat-value-small">{stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label-small">Correct:</span>
                  <span className="stat-value-small">{stats.correct}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label-small">Incorrect:</span>
                  <span className="stat-value-small">{stats.total - stats.correct}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stats.accuracy}%`,
                    backgroundColor: getSubjectColor(subject)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Areas to Work On */}
      {analytics.weak_areas.length > 0 && (
        <section className="weak-areas">
          <h2>Areas to Focus On</h2>
          <div className="weak-areas-list">
            {analytics.weak_areas.map((area, idx) => (
              <div key={idx} className="weak-area-card" style={{ borderColor: getSubjectColor(area.subject) }}>
                <div className="weak-area-header">
                  <h3 style={{ color: getSubjectColor(area.subject) }}>
                    {area.subject.charAt(0).toUpperCase() + area.subject.slice(1)}
                  </h3>
                  <span className={`priority-badge ${area.priority}`}>
                    {area.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="weak-area-stats">
                  <div className="weak-stat">
                    <span className="weak-label">Current Accuracy:</span>
                    <span className="weak-value">{area.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="weak-stat">
                    <span className="weak-label">Questions Attempted:</span>
                    <span className="weak-value">{area.total_attempted}</span>
                  </div>
                </div>
                <p className="weak-area-message">
                  Focus on practicing more {area.subject} questions to improve your score.
                </p>
                <button 
                  onClick={() => navigate(`/questions?subject=${area.subject}`)}
                  className="focus-button"
                  style={{ backgroundColor: getSubjectColor(area.subject) }}
                >
                  Practice {area.subject.charAt(0).toUpperCase() + area.subject.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Feedback Section */}
      {aiFeedback && (
        <section className="ai-feedback-section">
          <h2>Personalized Recommendations</h2>
          <div className="feedback-card">
            {aiFeedback.ai_generated && (
              <span className="ai-badge">AI Generated</span>
            )}
            <div className="feedback-content">
              {aiFeedback.feedback.split('\n').map((line, idx) => (
                <p key={idx} className="feedback-line">{line}</p>
              ))}
            </div>
            <div className="recommendations">
              <h3>Action Items</h3>
              <ul>
                {aiFeedback.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="summary-cta">
        <h2>Ready to Improve Your Score?</h2>
        <p>Continue practicing to boost your ACT performance</p>
        <button onClick={() => navigate('/questions')} className="cta-button-large">
          Continue Practicing
        </button>
      </section>
    </div>
  );
};

export default SummaryPage;

