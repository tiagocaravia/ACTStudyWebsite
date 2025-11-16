import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Get Into Your Dream College with ACT Prep
          </h1>
          <p className="hero-subtitle">
            <strong>7 out of 8 Ivy League schools are test-required.</strong> A strong ACT score can help you get into your dream college, even with a lackluster GPA.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">7/8</div>
              <div className="stat-label">Ivy Leagues Require Tests</div>
            </div>
            <div className="stat">
              <div className="stat-number">+4</div>
              <div className="stat-label">Average Score Increase</div>
            </div>
            <div className="stat">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Practice Questions</div>
            </div>
          </div>
          <button 
            className="cta-button"
            onClick={() => navigate('/questions')}
          >
            Start Practicing Now
          </button>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="value-prop">
        <div className="value-prop-content">
          <h2>Why ACT Prep Matters</h2>
          <div className="value-cards">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Level the Playing Field</h3>
              <p>
                A strong ACT score can compensate for a lower GPA. Top colleges value standardized test performance as a predictor of academic success.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">📈</div>
              <h3>Boost Your Application</h3>
              <p>
                With 7 out of 8 Ivy League schools requiring test scores, a high ACT score is essential for competitive college admissions.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h3>AI-Powered Feedback</h3>
              <p>
                Get personalized feedback on your weak areas. Our AI analyzes your performance and provides targeted study recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-content">
          <h2>The Numbers Don't Lie</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-big">87.5%</div>
              <div className="stat-text">of Ivy League schools require test scores</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">+200</div>
              <div className="stat-text">points average improvement with practice</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">4</div>
              <div className="stat-text">subjects covered: Math, English, Reading, Science</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Boost Your ACT Score?</h2>
          <p>Start practicing today and get one step closer to your dream college.</p>
          <button 
            className="cta-button-large"
            onClick={() => navigate('/questions')}
          >
            Begin Your ACT Prep Journey
          </button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;

