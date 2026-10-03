import React from 'react';

const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070b19]">
      {/* Sleek Modern Gradient Accents (No moving stars or space particles) */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="absolute top-1/4 -right-40 w-[28rem] h-[28rem] rounded-full bg-cyan-600/10 blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] rounded-full bg-violet-600/10 blur-[150px]" />

      {/* Subtle modern structural grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

export default SpaceBackground;
