import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

const LoadingScreen = ({ onFinish, duration = 1200 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#050816] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Orbital Rings */}
        <div className="absolute w-28 h-28 rounded-full border border-cyan-500/30 animate-spin" style={{ animationDuration: '6s' }} />
        <div className="absolute w-36 h-36 rounded-full border border-purple-500/20 border-dashed animate-spin" style={{ animationDirection: 'reverse', animationDuration: '9s' }} />
        <div className="absolute w-44 h-44 rounded-full border border-pink-500/15" />

        {/* Orbiting Particle */}
        <div className="absolute w-40 h-40 animate-spin" style={{ animationDuration: '4s' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00E5FF]" />
        </div>

        {/* Glowing Center Logo */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 p-[1px] shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <div className="w-full h-full bg-[#050816] rounded-2xl flex items-center justify-center text-cyan-400">
            <Building2 className="w-8 h-8 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center space-y-1.5">
        <h2 className="text-sm font-extrabold tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Hostel Connect
        </h2>
        <p className="text-xs text-zinc-400 tracking-wider">
          Initializing Space Operations...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
