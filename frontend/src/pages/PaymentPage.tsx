import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Upgrade to Premium</h1>
        <p className="payment-subtitle">
          Unlock unlimited practice questions, advanced analytics, and personalized AI tutoring
        </p>

        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">Free</div>
            <ul className="features">
              <li>✓ Limited practice questions</li>
              <li>✓ Basic analytics</li>
              <li>✓ Rule-based feedback</li>
            </ul>
            <button className="pricing-button" disabled>
              Current Plan
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <h3>Premium</h3>
            <div className="price">$19.99<span>/month</span></div>
            <ul className="features">
              <li>✓ Unlimited practice questions</li>
              <li>✓ Advanced analytics & insights</li>
              <li>✓ AI-powered personalized feedback</li>
              <li>✓ Detailed performance tracking</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="pricing-button featured-button">
              Upgrade Now
            </button>
          </div>

          <div className="pricing-card">
            <h3>Annual</h3>
            <div className="price">$199<span>/year</span></div>
            <div className="savings">Save $40/year</div>
            <ul className="features">
              <li>✓ Everything in Premium</li>
              <li>✓ Best value</li>
              <li>✓ Annual commitment</li>
            </ul>
            <button className="pricing-button">
              Choose Annual
            </button>
          </div>
        </div>

        <div className="payment-note">
          <p>
            <strong>Note:</strong> Payment integration coming soon. 
            We're planning to integrate with Vendr for secure payment processing.
          </p>
          <p>
            For now, all features are available for free during our beta period.
          </p>
        </div>

        <div className="payment-actions">
          <button onClick={() => navigate('/questions')} className="back-button">
            Back to Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

