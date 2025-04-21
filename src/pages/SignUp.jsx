// src/pages/Signup.jsx
import React, { useState } from 'react';
import './SignUp.css';
import axios from 'axios';


const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '', // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmpassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/signup',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'member' // default role
        },
        { withCredentials: true }
      );
  
      console.log('Signup success:', res.data);
      alert('Signup successful! Please log in.');
      window.location.href = '/login';
  
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Signup failed');
    }
  };
  
  

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2>Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          required
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          required
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          required
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmpassword"
          placeholder="Confirm Password"
          value={formData.confirmpassword}
          required
          onChange={handleChange}
        />

        <button type="submit">Sign Up</button>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
