// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Member from './pages/Member';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />   
        <Route path="/admin" element={<Admin />} />
        <Route path="/member" element={<Member />} />
        {/* Add other routes here as you build */}
      </Routes>
    </Router>
  );
}

export default App;
