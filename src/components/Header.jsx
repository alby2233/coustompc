import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MonitorPlay } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <MonitorPlay size={24} style={{ color: '#0ea5e9' }} />
          <span>NeoBuild AI</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/builder" className={location.pathname === '/builder' ? 'active' : ''}>PC Builder</Link>
        </nav>
      </div>
    </header>
  );
}
