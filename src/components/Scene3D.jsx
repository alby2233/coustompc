import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Box, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import PCModel from './models/PCModel';

function CameraRig({ selectedComponent, orbitRef }) {
  const [isResetting, setIsResetting] = useState(false);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    if (selectedComponent === null) {
      setIsResetting(true);
      const timer = setTimeout(() => setIsResetting(false), 1500); // Only animate reset for 1.5s
      return () => clearTimeout(timer);
    } else {
      setIsResetting(false);
    }
  }, [selectedComponent]);

  useFrame((state, delta) => {
    if (selectedComponent && orbitRef.current) {
      // Smoothly zoom in to the component
      orbitRef.current.target.lerp(selectedComponent.position, delta * 4);
      
      const targetCamPos = new THREE.Vector3(
        selectedComponent.position.x + selectedComponent.zoomOffset[0],
        selectedComponent.position.y + selectedComponent.zoomOffset[1],
        selectedComponent.position.z + selectedComponent.zoomOffset[2]
      );
      state.camera.position.lerp(targetCamPos, delta * 4);
    } else if (isResetting && orbitRef.current) {
      // Zoom out smoothly, then hand control back to the user
      orbitRef.current.target.lerp(defaultTarget, delta * 4);
      const defaultCam = new THREE.Vector3(6, 5, 8);
      state.camera.position.lerp(defaultCam, delta * 2);
    }
  });
  return null;
}

export default function Scene3D({ aesthetics, isPoweredOn, isHologramMode, currentBuild, rgbColor, isGlassVisible, isBooting }) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const orbitRef = useRef();

  const handlePointerMissed = () => {
    if (selectedComponent) {
      setSelectedComponent(null);
    }
  };

  return (
    <div className="canvas-container" style={{ background: isHologramMode ? '#020617' : 'transparent' }}>
      <Canvas camera={{ position: [6, 5, 8], fov: 45 }} onPointerMissed={handlePointerMissed}>
        <color attach="background" args={[isHologramMode ? '#020617' : '#0f172a']} />
        
        <CameraRig selectedComponent={selectedComponent} orbitRef={orbitRef} />
        
        <ambientLight intensity={isPoweredOn ? 0.3 : 0.05} />
        <spotLight position={[10, 15, 10]} angle={0.15} penumbra={1} intensity={isPoweredOn ? 1.5 : 0.1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={isPoweredOn ? 0.5 : 0.05} />
        
        <Suspense fallback={null}>
          <PCModel 
            aesthetics={aesthetics} 
            isPoweredOn={isPoweredOn} 
            isHologramMode={isHologramMode} 
            currentBuild={currentBuild} 
            onSelectComponent={setSelectedComponent} 
            rgbColor={rgbColor}
            isGlassVisible={isGlassVisible}
            isBooting={isBooting}
          />
          
          {selectedComponent && selectedComponent.data && (
            <Html position={selectedComponent.position} center style={{ pointerEvents: 'none', transition: 'all 0.3s', opacity: 1, zIndex: 10 }}>
              <div style={{
                background: 'rgba(2, 6, 23, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '16px',
                width: '250px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1.1rem' }}>{selectedComponent.data.type}</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{selectedComponent.data.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{selectedComponent.data.price?.toLocaleString() || 'N/A'}</span>
                  {selectedComponent.data.link && selectedComponent.data.link !== '#' && (
                    <a href={selectedComponent.data.link} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: '0.8rem', pointerEvents: 'auto', textDecoration: 'none' }}>View Store →</a>
                  )}
                </div>
              </div>
            </Html>
          )}

          {/* --- GAMING DESK ENVIRONMENT --- */}
          {!isHologramMode && (
            <group position={[0, -1.5, 0]}>
              {/* Wooden Desk Surface */}
              <Box args={[16, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
                <meshStandardMaterial color="#3e2723" roughness={0.7} metalness={0.1} />
              </Box>
              {/* Large Mousepad */}
              <Box args={[8, 0.02, 4]} position={[0, 0.01, 1]} receiveShadow>
                <meshStandardMaterial color="#09090b" roughness={0.9} />
              </Box>
            </group>
          )}

          <Environment preset="city" />
          <ContactShadows position={[0, -1.49, 0]} opacity={0.7} scale={20} blur={2} far={4} />

          {/* --- CINEMATIC POST-PROCESSING --- */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.5} 
              luminanceSmoothing={0.9} 
              intensity={isHologramMode ? 2.5 : 1.5} 
              levels={8} 
              mipmapBlur 
            />
            <Vignette eskil={false} offset={0.1} darkness={isHologramMode ? 0.8 : 0.5} />
          </EffectComposer>
        </Suspense>
        
        <OrbitControls 
          ref={orbitRef}
          makeDefault
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={4}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}
