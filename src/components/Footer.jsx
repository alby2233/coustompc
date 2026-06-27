import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} NeoBuild AI. Powered by Google Gemini 2.5 and React Three Fiber.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
