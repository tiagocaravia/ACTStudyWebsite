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
            Get Into Your Dream College with AutoNate
          </h1>
          <p className="hero-subtitle">
            <strong>Test scores matter for college success.</strong> Research shows that standardized test scores provide critical information beyond GPA for predicting college performance, especially in STEM fields.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">38%</div>
              <div className="stat-label">Better Prediction in STEM</div>
            </div>
            <div className="stat">
              <div className="stat-number">4</div>
              <div className="stat-label">Subjects Covered</div>
            </div>
            <div className="stat">
              <div className="stat-number">AI</div>
              <div className="stat-label">Personalized Feedback</div>
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
              <h3>Predict College Success</h3>
              <p>
                Research shows test scores add significant predictive value beyond high school GPA, especially for STEM majors. Colleges use test scores to evaluate readiness for rigorous coursework.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">📈</div>
              <h3>Critical for STEM Readiness</h3>
              <p>
                Test scores are particularly valuable for predicting success in math, engineering, and physical sciences. They help colleges identify students who may need additional support.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h3>AI-Powered Feedback</h3>
              <p>
                Get personalized feedback on your weak areas. Our AI analyzes your performance and provides targeted study recommendations to improve your test scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-content">
          <h2>Why Test Scores Matter</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-big">38%</div>
              <div className="stat-text">Better prediction of first-year college performance for STEM majors when using test scores with GPA (vs. GPA alone)</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">Critical</div>
              <div className="stat-text">Test scores help colleges identify students who need academic support and proper course placement</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">Proven</div>
              <div className="stat-text">Research shows test scores predict college success across all institution types and selectivity levels</div>
            </div>
          </div>
          <div className="research-note">
            <p>
              <em>Source: College Board Research on the Relationship Between Test Scores and Postsecondary STEM Success</em>
            </p>
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

