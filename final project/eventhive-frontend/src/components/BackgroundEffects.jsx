import React, { useEffect, useRef } from 'react';
import './BackgroundEffects.css';
import Aurora from './Backgrounds/Aurora.jsx';

const BackgroundEffects = () => {
  const auraRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (auraRef.current) {
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
          auraRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="cyber-background-container">
      {/* React Bits Aurora Effect */}
      <Aurora 
        colorStops={["#06B6D4", "#8B5CF6", "#EC4899"]} 
        amplitude={1.5} 
        blend={0.5} 
      />

      {/* Noise overlay for premium GenZ texture */}
      <div className="cyber-noise"></div>

      {/* Mouse following glowing aura */}
      <div className="mouse-aura" ref={auraRef}></div>
    </div>
  );
};

export default BackgroundEffects;
