import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          AutoNate
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          {user && (
            <>
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
            </>
          )}
          <Link 
            to="/payment" 
            className={`nav-link ${isActive('/payment') ? 'active' : ''}`}
          >
            Pricing
          </Link>
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.username || user.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

