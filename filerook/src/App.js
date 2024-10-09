import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

// Import components for each route
import Home from './components/Home';
import MyFiles from './components/MyFiles';
import Upload from './components/Upload';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-logo">FileRook</div>
          <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/files">My Files</Link></li>
            <li><Link to="/upload">Upload</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<MyFiles />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
