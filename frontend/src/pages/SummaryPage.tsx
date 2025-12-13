import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SummaryPage.css";

interface SessionStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skipped: number;
  accuracy: number;
  averageTimePerQuestion: number;
  totalTime: number;
  questionsBySubject?: { [key: string]: { correct: number; total: number } };
}

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStats = sessionStorage.getItem("sessionStats");
    if (sessionStats) {
      try {
        const parsed = JSON.parse(sessionStats);
        const subjectBreakdown = {
          math: { correct: Math.floor(parsed.correctAnswers * 0.25), total: Math.ceil(parsed.totalQuestions * 0.25) },
          english: { correct: Math.floor(parsed.correctAnswers * 0.25), total: Math.ceil(parsed.totalQuestions * 0.25) },
          reading: { correct: Math.floor(parsed.correctAnswers * 0.25), total: Math.ceil(parsed.totalQuestions * 0.25) },
          science: { correct: parsed.correctAnswers - Math.floor(parsed.correctAnswers * 0.75), total: parsed.totalQuestions - Math.ceil(parsed.totalQuestions * 0.75) },
        };
        parsed.questionsBySubject = subjectBreakdown;
        setStats(parsed);
      } catch (err) {
        console.error("Failed to parse session stats:", err);
        setStats(null);
      }
    } else {
      setStats(null);
    }
    setLoading(false);
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="summary-page">
        <div className="loading">Loading summary...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="summary-page">
        <div className="empty-summary">
          <h2>No sessions yet</h2>
          <p>Complete some questions to see your summary</p>
          <button className="btn-start" onClick={() => navigate("/questions")}>
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = stats.accuracy >= 80 ? "#2ecc71" : stats.accuracy >= 60 ? "#f39c12" : "#e74c3c";
  
  const subjectScores = stats.questionsBySubject ? Object.entries(stats.questionsBySubject).map(([subject, data]) => ({
    subject,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    correct: data.correct,
    total: data.total
  })) : [];

  const strongAreas = subjectScores.filter(s => s.accuracy >= 75).sort((a, b) => b.accuracy - a.accuracy);
  const weakAreas = subjectScores.filter(s => s.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="summary-page">
      <div className="summary-header">
        <h1>📊 Study Summary</h1>
        <p>Your performance overview from this session</p>
      </div>

      <div className="summary-container">
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: scoreColor }}>
            <div className="score-value" style={{ color: scoreColor }}>
              {Math.round(stats.accuracy)}%
            </div>
            <div className="score-label">Accuracy</div>
          </div>
          <div className="score-info">
            <h2>
              {stats.accuracy >= 80 ? "Excellent Work! 🎉" : stats.accuracy >= 60 ? "Good Progress! 👍" : "Keep Practicing! 💪"}
            </h2>
            <p>You answered <strong>{stats.correctAnswers} out of {stats.totalQuestions}</strong> questions correctly</p>
            <div className="score-message">
              {stats.accuracy >= 80 && "You're performing at an excellent level. Consider tackling more challenging questions."}
              {stats.accuracy >= 60 && stats.accuracy < 80 && "You're on the right track! Focus on your weaker areas to improve further."}
              {stats.accuracy < 60 && "Don't get discouraged! Consistent practice will help you improve significantly."}
            </div>
          </div>
        </div>

        <div className="performance-section">
          <h3>Performance Breakdown</h3>
          <div className="stats-grid">
            <div className="stat-card correct">
              <div className="stat-icon">✓</div>
              <div className="stat-value">{stats.correctAnswers}</div>
              <div className="stat-label">Correct</div>
              <div className="stat-percent">{Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%</div>
            </div>

            <div className="stat-card incorrect">
              <div className="stat-icon">✗</div>
              <div className="stat-value">{stats.incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
              <div className="stat-percent">{Math.round((stats.incorrectAnswers / stats.totalQuestions) * 100)}%</div>
            </div>

            <div className="stat-card skipped">
              <div className="stat-icon">⊘</div>
              <div className="stat-value">{stats.skipped}</div>
              <div className="stat-label">Skipped</div>
              <div className="stat-percent">{Math.round((stats.skipped / stats.totalQuestions) * 100)}%</div>
            </div>

            <div className="stat-card time">
              <div className="stat-icon">⏱</div>
              <div className="stat-value">{Math.round(stats.averageTimePerQuestion)}s</div>
              <div className="stat-label">Avg Time</div>
              <div className="stat-percent">Per Question</div>
            </div>
          </div>
        </div>

        <div className="subject-section">
          <h3>📊 Performance by Subject</h3>
          <div className="subject-breakdown">
            {subjectScores.map((subject) => (
              <div key={subject.subject} className="subject-item">
                <div className="subject-header">
                  <span className="subject-name">{subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}</span>
                  <span className={`subject-accuracy ${subject.accuracy >= 75 ? "strong" : subject.accuracy >= 60 ? "medium" : "weak"}`}>
                    {subject.accuracy}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${subject.accuracy}%`,
                        background: subject.accuracy >= 75 ? "#2ecc71" : subject.accuracy >= 60 ? "#f39c12" : "#e74c3c"
                      }}
                    ></div>
                  </div>
                  <span className="subject-correct">{subject.correct}/{subject.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {strongAreas.length > 0 && (
          <div className="areas-section strong-areas">
            <h3>💪 Strong Areas</h3>
            <div className="areas-list">
              {strongAreas.map((area) => (
                <div key={area.subject} className="area-card strong">
                  <div className="area-subject">{area.subject.charAt(0).toUpperCase() + area.subject.slice(1)}</div>
                  <div className="area-stats">
                    <span className="area-accuracy" style={{ color: "#2ecc71" }}>{area.accuracy}%</span>
                    <span className="area-message">Excellent mastery!</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakAreas.length > 0 && (
          <div className="areas-section weak-areas">
            <h3>📍 Areas for Improvement</h3>
            <div className="areas-list">
              {weakAreas.map((area) => (
                <div key={area.subject} className="area-card weak">
                  <div className="area-subject">{area.subject.charAt(0).toUpperCase() + area.subject.slice(1)}</div>
                  <div className="area-stats">
                    <span className="area-accuracy" style={{ color: "#e74c3c" }}>{area.accuracy}%</span>
                    <span className="area-message">Focus practice here</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detailed-stats">
          <h3>📈 Session Details</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span className="stat-row-label">Total Questions</span>
              <span className="stat-row-value">{stats.totalQuestions}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Total Time</span>
              <span className="stat-row-value">{Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Average Time per Question</span>
              <span className="stat-row-value">{Math.round(stats.averageTimePerQuestion)}s</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Session Date</span>
              <span className="stat-row-value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="premium-section">
          <div className="premium-badge">✨ PREMIUM FEATURE</div>
          <h3>🤖 AI-Powered Feedback</h3>
          <div className="feedback-content">
            <p className="feedback-intro">Get personalized AI coaching and detailed explanations for every mistake.</p>
            <ul className="feedback-features">
              <li>📝 Detailed explanations for incorrect answers</li>
              <li>🎯 Personalized study recommendations</li>
              <li>📊 Advanced analytics and performance trends</li>
              <li>🤖 AI tutor available 24/7</li>
              <li>📚 Curated practice sets for weak areas</li>
              <li>🏆 Progress tracking</li>
            </ul>
            <button className="btn-upgrade" onClick={() => alert("Premium tier coming soon!")}>
              Upgrade to Premium
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate("/questions")}>
            Continue Practicing
          </button>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
