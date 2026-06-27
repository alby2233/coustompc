import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Builder from './pages/Builder';

function App() {
  return (
    <Router>
      <div className="site-wrapper">
        <Header />
        <main className="site-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/builder" element={<Builder />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
