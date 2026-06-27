import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, MeshDistortMaterial, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function PCModel({ 
  aesthetics = 'RGB', isPoweredOn = true, isHologramMode = false, 
  currentBuild = null, onSelectComponent, rgbColor = '#0ea5e9', 
  isGlassVisible = true, isBooting = false 
}) {
  const groupRef = useRef();
  const fansRef = useRef([]);
  
  const [motherboardTex, gpuTex, fanTex, aioTex, ramTex, caseMeshTex] = useTexture([
    '/motherboard.png',
    '/gpu.png',
    '/fan.png',
    '/aio.png',
    '/ram.png',
    '/case_mesh.png'
  ]);

  const handlePointerOver = (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; };
  const handlePointerOut = () => { document.body.style.cursor = 'auto'; };
  const handleClick = (e, zoomOffset, componentData) => {
    e.stopPropagation();
    if (onSelectComponent) onSelectComponent({ position: e.point, zoomOffset, data: componentData });
  };

  // Explode animation progress (0 = normal, 1 = exploded)
  const [explodeProgress, setExplodeProgress] = useState(0);

  const [bootColor, setBootColor] = useState(rgbColor);

  // Animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !isHologramMode) {
      groupRef.current.position.y = Math.sin(t / 2) * 0.05; // Milder float for heavy PC
    } else if (groupRef.current && isHologramMode) {
      groupRef.current.position.y = 0; // Lock Y in hologram mode for stable reading
      groupRef.current.rotation.y = t * 0.2; // Slowly rotate the hologram
    } else if (groupRef.current && !isHologramMode) {
       // Reset rotation gently
       groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
    }

    if (isBooting) {
      const hue = (t * 2) % 1;
      const c = new THREE.Color().setHSL(hue, 1, 0.5);
      setBootColor('#' + c.getHexString());
      
      fansRef.current.forEach((fan, i) => {
        if (fan) fan.rotation.y -= 0.6 + (i * 0.01);
      });
    } else {
      setBootColor(rgbColor);
      
      if (isPoweredOn || isHologramMode) {
        fansRef.current.forEach((fan, i) => {
          if (fan) fan.rotation.y -= 0.2 + (i * 0.01);
        });
      }
    }

    // Lerp explode progress
    const targetProgress = isHologramMode ? 1 : 0;
    setExplodeProgress((prev) => THREE.MathUtils.lerp(prev, targetProgress, delta * 3));
  });

  const safeAesthetics = aesthetics || '';
  const isRGB = safeAesthetics.includes('RGB');
  const isWhite = safeAesthetics.includes('White');
  const isStealth = safeAesthetics.includes('Stealth');

  // Realistic Materials & Colors
  const chassisMetal = isWhite ? '#e2e8f0' : '#18181b';
  const interiorMetal = isWhite ? '#cbd5e1' : '#0f0f12';
  const activeAccent = isRGB ? (isBooting ? bootColor : rgbColor) : (isWhite ? '#ffffff' : '#333333');
  const emissiveIntensity = isPoweredOn ? (isBooting ? 3 : 2) : 0;
  
  // AIO Tubes Geometry
  const tubeCurve1 = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.7, 3.3, 0.3), // CPU Pump
    new THREE.Vector3(-0.2, 3.6, 1.2),
    new THREE.Vector3(0.2, 4.3, 1.0)   // Radiator
  ]), []);

  const tubeCurve2 = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, 3.3, 0.3), // CPU Pump
    new THREE.Vector3(-0.4, 3.7, 1.4),
    new THREE.Vector3(0.0, 4.3, 1.2)   // Radiator
  ]), []);

  // Smart Material Component that overrides when in hologram mode
  const SmartMaterial = ({ standardProps, isGlass = false, isLight = false, map = null }) => {
    if (isHologramMode) {
      return (
        <meshBasicMaterial 
          color={isLight ? "#ffffff" : "#06b6d4"} 
          wireframe={!isLight}
          transparent={true}
          opacity={isLight ? 0.9 : 0.4 + (explodeProgress * 0.2)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      );
    }
    if (isGlass) return <meshPhysicalMaterial map={map} {...standardProps} />;
    return <meshStandardMaterial map={map} {...standardProps} />;
  };

  // Get dynamic component data
  const getComponentData = (typeStr, defaultName) => {
    if (!currentBuild || !currentBuild.components) return { name: defaultName, price: 0, link: '#' };
    const comp = currentBuild.components.find(c => c.type.toLowerCase().includes(typeStr.toLowerCase()));
    return comp ? comp : { name: defaultName, price: 0, link: '#' };
  };

  const cpuData = getComponentData('CPU', 'AI CPU Cooler');
  const gpuData = getComponentData('GPU', 'AI Graphics Card');
  const ramData = getComponentData('RAM', 'AI Memory (RAM)');
  const caseData = getComponentData('Case', 'AI PC Case');
  const moboData = getComponentData('Motherboard', 'AI Motherboard');

  // Floating Label Component
  const HologramLabel = ({ text, offset = [0, 0, 0], visible }) => {
    if (!visible) return null;
    return (
      <Html position={offset} center className="hologram-label" style={{ opacity: explodeProgress }}>
        <div style={{
          color: '#06b6d4',
          border: '1px solid #06b6d4',
          background: 'rgba(6, 182, 212, 0.1)',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 10px rgba(6,182,212,0.5)'
        }}>
          {text}
        </div>
        <svg width="2" height="40" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)' }}>
          <line x1="1" y1="0" x2="1" y2="40" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" />
        </svg>
      </Html>
    );
  };

  // Explode Offsets
  const explodeX = explodeProgress;
  const explodeY = explodeProgress;
  const explodeZ = explodeProgress;

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* --- DYNAMIC INTERNAL LIGHTING --- */}
      {isPoweredOn && isRGB && !isHologramMode && (
        <>
          <pointLight position={[-0.5, 3.0, 0.5]} intensity={1.5} color={activeAccent} distance={5} />
          <pointLight position={[0.5, 1.5, 2.0]} intensity={1} color="#38bdf8" distance={4} />
        </>
      )}

      {/* --- CASE FRAME --- */}
      <group position={[0, explodeY * -0.5, 0]}>
        {/* Motherboard Tray (Back wall) */}
        <Box args={[0.1, 4.5, 4.8]} position={[-1.25, 2.25, 0]} castShadow receiveShadow>
          <SmartMaterial standardProps={{ color: interiorMetal, metalness: 0.7, roughness: 0.4 }} />
        </Box>
        
        {/* Top Panel */}
        <Box args={[2.6, 0.1, 5.0]} position={[0, 4.55 + (explodeY * 0.5), 0]} castShadow receiveShadow>
          <SmartMaterial standardProps={{ color: chassisMetal, metalness: 0.8, roughness: 0.3 }} />
        </Box>

        {/* Bottom Panel */}
        <Box args={[2.6, 0.1, 5.0]} position={[0, 0, 0]} castShadow receiveShadow>
          <SmartMaterial standardProps={{ color: chassisMetal, metalness: 0.8, roughness: 0.3 }} />
        </Box>

        {/* Rear Panel (with IO cutout) */}
        <Box args={[2.6, 4.5, 0.1]} position={[0, 2.25, -2.45 - (explodeZ * 0.5)]} castShadow receiveShadow>
          <SmartMaterial standardProps={{ color: chassisMetal, metalness: 0.8, roughness: 0.3 }} />
        </Box>
        
        {/* Front Panel (Mesh Design for realism) */}
        <group position={[0, 2.25, 2.45 + (explodeZ * 1.5)]}>
          <Box args={[2.6, 4.5, 0.05]}>
             <SmartMaterial standardProps={{ color: "#ffffff", transparent: true, opacity: 0.9 }} map={caseMeshTex} />
          </Box>
          <HologramLabel text={caseData.name} offset={[0, 3, 0]} visible={isHologramMode} />
        </group>

        {/* --- FRONT PANEL FANS --- */}
        {[0, 1.2, 2.4].map((y, i) => (
          <group key={i} position={[0, 1.1 + y, 2.2 + (explodeZ * 1.2)]}>
            <Cylinder ref={(el) => (fansRef.current[i + 3] = el)} args={[0.55, 0.55, 0.05, 24]} rotation={[Math.PI / 2, 0, 0]}>
              <SmartMaterial standardProps={{ color: "#ffffff" }} map={fanTex} />
            </Cylinder>
            <Cylinder args={[0.58, 0.58, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]}>
               <SmartMaterial standardProps={{ color: activeAccent, emissive: activeAccent, emissiveIntensity: emissiveIntensity * 1.2, transparent: true, opacity: 0.9 }} isLight={isRGB && isPoweredOn} />
            </Cylinder>
            <Cylinder args={[0.62, 0.62, 0.15, 32]} rotation={[Math.PI / 2, 0, 0]}>
               <SmartMaterial standardProps={{ color: "#000" }} />
            </Cylinder>
          </group>
        ))}
      </group>
      {/* --- TEMPERED GLASS SIDE PANEL --- */}
      {isGlassVisible && (
        <group position={[1.25 + (explodeX * 2), 2.25, 0]}>
          <Box args={[0.04, 4.4, 4.8]}>
            <SmartMaterial isGlass standardProps={{ color: '#000000', metalness: 0.1, roughness: 0.02, transmission: 0.98, thickness: 0.05, transparent: true, opacity: isPoweredOn ? 0.3 : 0.6, clearcoat: 1 }} />
          </Box>
          <Box args={[0.05, 4.5, 0.2]} position={[0, 0, 2.35]}>
            <SmartMaterial standardProps={{ color: "#000", roughness: 0.1 }} />
          </Box>
          <Box args={[0.05, 4.5, 0.2]} position={[0, 0, -2.35]}>
            <SmartMaterial standardProps={{ color: "#000", roughness: 0.1 }} />
          </Box>
          <Box args={[0.05, 0.2, 4.8]} position={[0, 2.15, 0]}>
            <SmartMaterial standardProps={{ color: "#000", roughness: 0.1 }} />
          </Box>
          <Box args={[0.05, 0.2, 4.8]} position={[0, -2.15, 0]}>
            <SmartMaterial standardProps={{ color: "#000", roughness: 0.1 }} />
          </Box>
        </group>
      )}

      {/* --- MOTHERBOARD CORE COMPONENTS --- */}
      <group position={[0, explodeY * 0.2, 0]}>
        {/* Motherboard PCB */}
        <Box 
          args={[0.05, 3.2, 3.2]} 
          position={[-1.15, 2.8, -0.3]} 
          castShadow 
          receiveShadow
          onClick={(e) => handleClick(e, [2.0, 1.0, 0.5], moboData)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <SmartMaterial standardProps={{ color: "#ffffff", roughness: 0.9 }} map={motherboardTex} />
        </Box>

        {/* --- RAM STICKS --- */}
        {[-0.1, 0.1, 0.3, 0.5].map((z, i) => (
          <group 
            key={i} 
            position={[-0.9, 3.4 + (explodeY * 0.5), 0.6 + z]}
            onClick={(e) => handleClick(e, [1.5, 0.5, 0.5], ramData)}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <Box args={[0.06, 0.7, 0.15]}>
              <SmartMaterial standardProps={{ color: "#ffffff" }} map={ramTex} />
            </Box>
            <Box args={[0.04, 0.7, 0.03]} position={[0.02, 0, 0]}>
               <SmartMaterial standardProps={{ color: activeAccent, emissive: activeAccent, emissiveIntensity: emissiveIntensity * 0.8 }} isLight={isRGB && isPoweredOn} />
            </Box>
            {i === 2 && <HologramLabel text={ramData.name} offset={[0, 1.5, 0]} visible={isHologramMode} />}
          </group>
        ))}

        {/* --- CPU COOLER (AIO Pump) --- */}
        <group 
          position={[-1.0 - (explodeX * 0.2), 3.4 + (explodeY * 0.2), -0.2]} 
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => handleClick(e, [1.5, 0.5, 0.0], cpuData)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <Cylinder args={[0.3, 0.3, 0.2, 32]} castShadow>
            <SmartMaterial standardProps={{ color: "#09090b", metalness: 0.8, roughness: 0.2 }} />
          </Cylinder>
          <Cylinder args={[0.26, 0.26, 0.22, 32]}>
            {!isHologramMode && isPoweredOn ? (
              <SmartMaterial standardProps={{ color: "#ffffff" }} map={aioTex} />
            ) : (
              <SmartMaterial standardProps={{ color: "#000" }} isLight={isHologramMode} />
            )}
          </Cylinder>
          <HologramLabel text={cpuData.name} offset={[1.5, 0, 0]} visible={isHologramMode} />
        </group>

        {/* Top Radiator (Moves up on explode) */}
        <group position={[0, explodeY * 1.5, 0]}>
          <Box args={[1.2, 0.2, 3.0]} position={[0, 4.4, 0]} castShadow>
            <SmartMaterial standardProps={{ color: "#09090b", roughness: 0.8 }} />
          </Box>
          {/* Top Fans */}
          {[-1, 0, 1].map((z, i) => (
            <group key={i} position={[0, 4.3, z]}>
              <Cylinder ref={(el) => (fansRef.current[i + 6] = el)} args={[0.5, 0.5, 0.05, 24]}>
                <SmartMaterial standardProps={{ color: "#ffffff" }} map={fanTex} />
              </Cylinder>
              <Cylinder args={[0.53, 0.53, 0.08, 32]}>
                 <SmartMaterial standardProps={{ color: activeAccent, emissive: activeAccent, emissiveIntensity: emissiveIntensity }} isLight={isRGB && isPoweredOn} />
              </Cylinder>
            </group>
          ))}
        </group>

        {/* AIO Tubes */}
        <mesh position={[0, explodeY * 0.5, 0]}>
          <tubeGeometry args={[tubeCurve1, 32, 0.04, 8, false]} />
          <SmartMaterial standardProps={{ color: "#18181b", roughness: 0.8 }} />
        </mesh>
        <mesh position={[0, explodeY * 0.5, 0]}>
          <tubeGeometry args={[tubeCurve2, 32, 0.04, 8, false]} />
          <SmartMaterial standardProps={{ color: "#18181b", roughness: 0.8 }} />
        </mesh>
      </group>

      {/* --- GRAPHICS CARD (GPU) --- */}
      <group 
        position={[-0.4, 1.6, -0.3 + (explodeZ * 1.5)]}
        onClick={(e) => handleClick(e, [0.0, 1.5, 3.0], gpuData)}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <Box args={[1.5, 0.05, 3.2]} position={[0, 0.35, 0]} castShadow>
          <SmartMaterial standardProps={{ color: "#ffffff", metalness: 0.2, roughness: 0.8 }} map={gpuTex} />
        </Box>
        <Box args={[1.4, 0.02, 3.1]} position={[0, 0.3, 0]}>
          <SmartMaterial standardProps={{ color: "#000" }} />
        </Box>
        <Box args={[1.4, 0.4, 3.1]} position={[0, 0.1, 0]}>
          <SmartMaterial standardProps={{ color: "#3f3f46", metalness: 0.9, roughness: 0.4 }} />
        </Box>
        <Box args={[1.5, 0.1, 3.2]} position={[0, -0.15, 0]} castShadow>
           <SmartMaterial standardProps={{ color: isWhite ? '#ffffff' : '#09090b', metalness: 0.6 }} />
        </Box>
        {/* GPU Fans */}
        {[-0.8, 0, 0.8].map((z, i) => (
          <group key={i} position={[0.75, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
            <Cylinder ref={(el) => (fansRef.current[i] = el)} args={[0.4, 0.4, 0.05, 24]}>
               <SmartMaterial standardProps={{ color: "#ffffff" }} map={fanTex} />
            </Cylinder>
          </group>
        ))}
        {/* PCIe Power Cables */}
        <Cylinder args={[0.05, 0.05, 1.0, 8]} position={[0.7, -0.6, 1.0]} rotation={[Math.PI / 4, 0, 0]}>
          <SmartMaterial standardProps={{ color: isWhite ? '#ffffff' : '#000' }} />
        </Cylinder>
        
        <HologramLabel text={gpuData.name} offset={[1.5, 1.0, 0]} visible={isHologramMode} />
      </group>

      {/* --- POWER SUPPLY (PSU) Cover --- */}
      <group position={[0, explodeY * -0.2, 0]}>
        <Box args={[2.4, 1.0, 4.8]} position={[-0.05, 0.5, 0]} castShadow receiveShadow>
          <SmartMaterial standardProps={{ color: chassisMetal, roughness: 0.5 }} />
        </Box>
      </group>

      {/* Floor reflection plane */}
      {!isHologramMode && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#050811" roughness={0.1} metalness={0.9} />
        </mesh>
      )}
    </group>
  );
}
