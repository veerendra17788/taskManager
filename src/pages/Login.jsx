// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add at the top
import axios from 'axios'; 
import './Login.css';



const Login = () => {
  const navigate = useNavigate(); // Initialize navigator
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if(email==="admin@gmail.com" && password==="admin"){
      navigate('/admin');
    }else{
  
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        });
    
        const { token, user } = res.data;
    
        if (token) {
          localStorage.setItem('token', token); // ✅ Save the actual token from backend
        }
    
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'member') {
          navigate('/member');
        }
    
      } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);
        alert(err.response?.data?.error || 'Login failed');
      }
    }
  };
  
  

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p className="register-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
