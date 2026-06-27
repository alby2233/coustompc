import React, { useState } from 'react';
import { Cpu, MonitorPlay, Zap, Key, Server, Layout, ShieldCheck } from 'lucide-react';

export default function InputPanel({ 
  onSubmit, isLoading, isPoweredOn, onTogglePower, isHologramMode, 
  onToggleHologram, onReset, hasResults, rgbColor, setRgbColor, 
  isGlassVisible, setIsGlassVisible 
}) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [budget, setBudget] = useState('100000');
  const [useCase, setUseCase] = useState('Gaming');
  const [aesthetics, setAesthetics] = useState('RGB / Flashy');
  const [formFactor, setFormFactor] = useState('ATX Mid Tower');
  const [brandPref, setBrandPref] = useState('No Preference');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelError, setModelError] = useState('');

  const handleFetchModels = async () => {
    if (!apiKey) {
      setModelError("Please enter an API key first.");
      return;
    }
    setIsFetchingModels(true);
    setModelError('');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) throw new Error("Invalid API Key or network error.");
      const data = await response.json();
      
      // Filter models that support generateContent and text generation
      const models = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace('models/', ''));
        
      if (models.length > 0) {
        setAvailableModels(models);
        setModelName(models[0]); // Select first available
      } else {
        setModelError("No supported models found for this key.");
      }
    } catch (err) {
      setModelError(err.message);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ apiKey, modelName, budget, useCase, aesthetics, formFactor, brandPref });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%' }}>
      <h1>AI PC Builder</h1>
      <p style={{ marginBottom: '24px' }}>Build your dream PC using the power of AI.</p>

      <form onSubmit={handleSubmit}>


        <div className="form-group">
          <label className="label">
            <Zap size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Budget (₹ INR)
          </label>
          <input
            type="number"
            className="glass-input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 100000"
            required
            min="20000"
          />
        </div>

        <div className="form-group">
          <label className="label">
            <MonitorPlay size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Primary Use Case
          </label>
          <select 
            className="glass-input"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)' }}
          >
            <option value="Gaming">Gaming</option>
            <option value="Productivity / Office">Productivity / Office</option>
            <option value="Video Editing">Video Editing</option>
            <option value="AI / Machine Learning">AI / Machine Learning</option>
            <option value="Streaming">Streaming</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Brand Preference</label>
          <select className="glass-input" value={brandPref} onChange={(e) => setBrandPref(e.target.value)} disabled={isLoading} style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)' }}>
            <option>No Preference</option>
            <option>AMD CPU + AMD GPU</option>
            <option>Intel CPU + NVIDIA GPU</option>
            <option>AMD CPU + NVIDIA GPU</option>
            <option>Intel CPU + AMD GPU</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Form Factor</label>
          <select className="glass-input" value={formFactor} onChange={(e) => setFormFactor(e.target.value)} disabled={isLoading} style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)' }}>
            <option>ATX Mid Tower</option>
            <option>Micro-ATX</option>
            <option>Mini-ITX</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">
            <Cpu size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Aesthetics Preference
          </label>
          <select 
            className="glass-input"
            value={aesthetics}
            onChange={(e) => setAesthetics(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)' }}
          >
            <option value="RGB / Flashy">RGB / Flashy</option>
            <option value="Stealth / Blackout">Stealth / Blackout</option>
            <option value="Minimalist / White">Minimalist / White</option>
            <option value="Compact / Small Form Factor">Compact / Small Form Factor</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            className="glass-button" 
            style={{ flex: '1 1 100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Generating Build...' : 'Generate Build'}
          </button>
          
          <button 
            type="button" 
            className="glass-button" 
            style={{ flex: 1, background: isPoweredOn ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', border: `1px solid ${isPoweredOn ? '#ef4444' : '#10b981'}`, color: isPoweredOn ? '#ef4444' : '#10b981' }}
            onClick={onTogglePower}
          >
            {isPoweredOn ? 'Power Off' : 'Power On'}
          </button>

          <button 
            type="button" 
            className="glass-button" 
            style={{ flex: 1, background: isHologramMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${isHologramMode ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`, color: isHologramMode ? '#06b6d4' : '#fff' }}
            onClick={onToggleHologram}
          >
            {isHologramMode ? 'Standard View' : 'Hologram View'}
          </button>
        </div>

        {hasResults && (
          <>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="label">RGB Lighting Color</label>
              <input 
                type="color" 
                value={rgbColor} 
                onChange={(e) => setRgbColor(e.target.value)}
                style={{ width: '100%', height: '40px', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
              />
            </div>
            
            <button 
              type="button" 
              className="glass-button" 
              style={{ width: '100%', marginBottom: '16px', background: isGlassVisible ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.2)', border: isGlassVisible ? '1px solid rgba(255,255,255,0.1)' : '1px solid #10b981', color: isGlassVisible ? '#fff' : '#10b981' }}
              onClick={() => setIsGlassVisible(!isGlassVisible)}
            >
              {isGlassVisible ? 'Remove Glass Panel' : 'Attach Glass Panel'}
            </button>

            <button 
              type="button" 
              className="glass-button" 
              style={{ width: '100%', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', color: '#f43f5e' }}
              onClick={onReset}
            >
              Clear Results & Start Over
            </button>
          </>
        )}
      </form>
    </div>
  );
}
