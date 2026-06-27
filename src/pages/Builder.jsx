import React, { useState } from 'react';
import InputPanel from '../components/InputPanel';
import PartsList from '../components/PartsList';
import Scene3D from '../components/Scene3D';
import { getPCRecommendation } from '../services/aiRecommender';

export default function Builder() {
  const [buildData, setBuildData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aesthetics, setAesthetics] = useState('RGB / Flashy');
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  
  // Phase 3 States
  const [activeTab, setActiveTab] = useState(0);
  const [isHologramMode, setIsHologramMode] = useState(false);

  // Phase 8 States
  const [rgbColor, setRgbColor] = useState('#0ea5e9');
  const [isGlassVisible, setIsGlassVisible] = useState(true);
  const [isBooting, setIsBooting] = useState(false);

  const handleGenerateBuild = async (requirements) => {
    setIsLoading(true);
    setError('');
    setAesthetics(requirements.aesthetics);
    setIsPoweredOn(true); // Turn on when generating a new build
    setIsHologramMode(false); // Turn off hologram mode on new build
    setActiveTab(0);
    
    try {
      const data = await getPCRecommendation(
        requirements.apiKey,
        requirements.modelName,
        requirements.budget,
        requirements.useCase,
        requirements.aesthetics,
        requirements.formFactor,
        requirements.brandPref
      );
      setBuildData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBuildData(null);
    setIsHologramMode(false);
    setIsPoweredOn(true);
    setActiveTab(0);
  };

  const togglePower = () => {
    if (!isPoweredOn) {
      setIsBooting(true);
      setTimeout(() => setIsBooting(false), 2500);
    }
    setIsPoweredOn(!isPoweredOn);
  };
  
  const toggleHologram = () => setIsHologramMode(!isHologramMode);

  // Compute current build to pass to 3D Scene
  const currentBuild = buildData && buildData.builds ? buildData.builds[activeTab] : null;

  return (
    <div className="app-container" style={{ position: 'relative', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* 3D Background / Main View */}
      <div className="main-view">
        <Scene3D 
          aesthetics={aesthetics} 
          isPoweredOn={isPoweredOn} 
          isHologramMode={isHologramMode} 
          currentBuild={currentBuild} 
          rgbColor={rgbColor}
          isGlassVisible={isGlassVisible}
          isBooting={isBooting}
        />
      </div>

      {/* Left Sidebar Form */}
      <div className="sidebar" style={{ zIndex: 10 }}>
        <InputPanel 
          onSubmit={handleGenerateBuild} 
          isLoading={isLoading} 
          isPoweredOn={isPoweredOn}
          onTogglePower={togglePower}
          isHologramMode={isHologramMode}
          onToggleHologram={toggleHologram}
          onReset={handleReset}
          hasResults={!!buildData}
          rgbColor={rgbColor}
          setRgbColor={setRgbColor}
          isGlassVisible={isGlassVisible}
          setIsGlassVisible={setIsGlassVisible}
        />
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Right Floating Panel for Results */}
      {buildData && (
        <div style={{ zIndex: 10 }}>
          <PartsList buildData={buildData} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
}
