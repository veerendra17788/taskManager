// src/pages/Home.jsx
import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLOGIN = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Task Management Tool</h1>
        <p>Organize, Track, and Manage your tasks efficiently.</p>
      </header>

      <div className="home-content">
        <button className="home-button" onClick={handleLOGIN}>
          LOGIN
        </button>
        <button className="home-button" onClick={handleSignUp}>
          SIGN UP
        </button>
      </div>
    </div>
  );
};

export default Home;
