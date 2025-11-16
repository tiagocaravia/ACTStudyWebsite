import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          ACT Prep
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/questions" 
            className={`nav-link ${isActive('/questions') ? 'active' : ''}`}
          >
            Practice
          </Link>
          <Link 
            to="/summary" 
            className={`nav-link ${isActive('/summary') ? 'active' : ''}`}
          >
            Summary
          </Link>
          <Link 
            to="/payment" 
            className={`nav-link ${isActive('/payment') ? 'active' : ''}`}
          >
            Pricing
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

