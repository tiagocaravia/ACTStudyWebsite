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
            Your ACT Score Determines Your College Options
          </h1>
          <p className="hero-subtitle">
            <strong>Top colleges are bringing back required test scores.</strong> Ivy League schools, MIT, Stanford, and elite universities have reinstated standardized testing requirements. Your ACT score is now more critical than ever for admission to competitive schools.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">8/8</div>
              <div className="stat-label">Ivy League Schools Require Tests</div>
            </div>
            <div className="stat">
              <div className="stat-number">34+</div>
              <div className="stat-label">Average Score at Top Schools</div>
            </div>
            <div className="stat">
              <div className="stat-number">AI</div>
              <div className="stat-label">Personalized Study Plan</div>
            </div>
          </div>
          <button 
            className="cta-button"
            onClick={() => navigate('/signup')}
          >
            Start Preparing Now
          </button>
        </div>
      </section>

      {/* Why Scores Matter Now */}
      <section className="value-prop">
        <div className="value-prop-content">
          <h2>Why Your ACT Score Matters More Than Ever</h2>
          <div className="value-cards">
            <div className="value-card">
              <div className="value-icon">�</div>
              <h3>Ivy League Schools Require Testing</h3>
              <p>
                Harvard, Yale, Princeton, Columbia, and all Ivy League schools have reinstated standardized testing requirements after abandoning test-optional policies. Your ACT score is now essential for admission consideration.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">📊</div>
              <h3>Your Competitive Edge</h3>
              <p>
                A strong ACT score can set you apart from thousands of applicants with similar GPAs. Schools use test scores to identify students capable of handling rigorous coursework and succeed in competitive academic environments.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">�</div>
              <h3>Scholarship & Merit Aid</h3>
              <p>
                Higher test scores unlock more scholarship opportunities and merit aid from top universities. Many schools use score-based merit scholarships that can cover 25-100% of tuition costs.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h3>AI-Powered Test Prep</h3>
              <p>
                Get personalized study plans that target your weak areas. Our AI analyzes your performance patterns and creates a customized prep strategy to maximize your score improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Admission Stats */}
      <section className="stats-section">
        <div className="stats-content">
          <h2>The College Admission Reality</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-big">Ivy League</div>
              <div className="stat-text">All 8 Ivy League schools have reinstated standardized testing as a required component of applications (2024-2025 cycle)</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">34-35</div>
              <div className="stat-text">Average ACT score for admitted students at Ivy League and top 20 universities. Students scoring 33+ are significantly more competitive.</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">70%</div>
              <div className="stat-text">of top 50 universities now require or strongly recommend standardized test scores for admission decisions</div>
            </div>
            <div className="stat-item">
              <div className="stat-big">2-3 Points</div>
              <div className="stat-text">Average score improvement with targeted, strategic ACT prep. Many students improve 4-6 points with focused study.</div>
            </div>
          </div>
          <div className="research-note">
            <p>
              <em>Source: College Board, National Association for College Admission Counseling (NACAC), and 2024-2025 university admissions reports</em>
            </p>
          </div>
        </div>
      </section>

      {/* Top Universities Section */}
      <section className="universities-section">
        <div className="universities-content">
          <h2>Schools That Require ACT Scores</h2>
          <p className="universities-intro">These top universities now require standardized test scores for admission:</p>
          <div className="universities-grid">
            <div className="university-card">
              <h4>Ivy League (All 8)</h4>
              <p>Harvard, Yale, Princeton, Columbia, Pennsylvania, Dartmouth, Brown, Cornell</p>
              <div className="avg-score">Average: 34-35</div>
            </div>
            <div className="university-card">
              <h4>Top Private Universities</h4>
              <p>MIT, Stanford, Duke, Northwestern, Johns Hopkins, Chicago, Rice, Emory</p>
              <div className="avg-score">Average: 34-36</div>
            </div>
            <div className="university-card">
              <h4>Elite Public Universities</h4>
              <p>UC Berkeley, UCLA, Michigan, Virginia, North Carolina, Texas, Indiana</p>
              <div className="avg-score">Average: 33-35</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Don't Let Your ACT Score Hold You Back From Your Dream School</h2>
          <p>Start preparing now with personalized study plans and AI-powered feedback.</p>
          <button 
            className="cta-button-large"
            onClick={() => navigate('/signup')}
          >
            Begin Your ACT Prep Today
          </button>
          <p className="cta-subtext">Free to start. Get your first practice test now.</p>
        </div>
      </section>
    </div>
  );
};

export default Homepage;

