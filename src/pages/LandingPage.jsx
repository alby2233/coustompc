import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, MonitorPlay, Layers } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Build Your Dream PC</h1>
          <h2 className="hero-subtitle">
            Powered by Next-Gen Google Gemini AI & Interactive 3D Holograms
          </h2>
          <p className="hero-description">
            Describe your ideal PC build and let AI select the perfect components for you. 
            Visualize it instantly in a cinematic 3D environment before you buy.
          </p>
          <button className="primary-button cta-button" onClick={() => navigate('/builder')}>
            Start Building Now <Zap size={18} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <Cpu className="feature-icon" size={32} />
          <h3>AI-Powered Recommendations</h3>
          <p>Gemini 2.5 analyzes your budget and needs to find the absolute best components and ensures 100% compatibility.</p>
        </div>
        <div className="feature-card">
          <MonitorPlay className="feature-icon" size={32} />
          <h3>Interactive 3D Engine</h3>
          <p>See your build come to life in the browser with photorealistic textures, spinning fans, and dynamic RGB lighting.</p>
        </div>
        <div className="feature-card">
          <Layers className="feature-icon" size={32} />
          <h3>Hologram Mode</h3>
          <p>Explode the PC apart to inspect individual parts in a Stark Industries-inspired wireframe view.</p>
        </div>
      </div>
    </div>
  );
}
