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
            <h3>Monthly</h3>
            <div className="price">$8<span>/month</span></div>
            <ul className="features">
              <li>✓ Unlimited practice questions</li>
              <li>✓ Advanced analytics & insights</li>
              <li>✓ AI-powered personalized feedback</li>
              <li>✓ Detailed performance tracking</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="pricing-button featured-button">
              Subscribe Now
            </button>
          </div>

          <div className="pricing-card">
            <div className="best-value-badge">Best Value</div>
            <h3>Lifetime</h3>
            <div className="price">$150</div>
            <div className="savings">One-time payment</div>
            <ul className="features">
              <li>✓ Everything in Monthly</li>
              <li>✓ Lifetime access</li>
              <li>✓ No recurring charges</li>
              <li>✓ All future updates included</li>
              <li>✓ Perfect for long-term prep</li>
            </ul>
            <button className="pricing-button">
              Get Lifetime Access
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

