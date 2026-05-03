import React, { useEffect, useRef } from 'react';
import './BackgroundEffects.css';

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
      {/* Noise overlay for premium GenZ texture */}
      <div className="cyber-noise"></div>

      {/* Floating Aurora Blobs */}
      <div className="cyber-blob blob-1"></div>
      <div className="cyber-blob blob-2"></div>
      <div className="cyber-blob blob-3"></div>

      {/* Mouse following glowing aura */}
      <div className="mouse-aura" ref={auraRef}></div>
    </div>
  );
};

export default BackgroundEffects;
