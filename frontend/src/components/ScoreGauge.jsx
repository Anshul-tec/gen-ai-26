import React from 'react';

export default function ScoreGauge({ score, max = 10, label, size = 'md' }) {
  const numericScore = typeof score === 'number' ? Math.min(Math.max(score, 0), max) : 0;
  const percentage = (numericScore / max) * 100;
  
  // Color determination
  let strokeColor = '#6366f1'; // Indigo
  let textColor = 'text-indigo-400';
  let bgColor = 'bg-indigo-500/10';

  if (numericScore >= 8) {
    strokeColor = '#10b981'; // Emerald
    textColor = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10';
  } else if (numericScore >= 6) {
    strokeColor = '#3b82f6'; // Blue
    textColor = 'text-blue-400';
    bgColor = 'bg-blue-500/10';
  } else if (numericScore >= 4) {
    strokeColor = '#f59e0b'; // Amber
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
  } else {
    strokeColor = '#ef4444'; // Rose
    textColor = 'text-rose-400';
    bgColor = 'bg-rose-500/10';
  }

  // Dimension settings
  const dimensions = {
    sm: { radius: 24, stroke: 4, width: 60, text: 'text-sm' },
    md: { radius: 36, stroke: 6, width: 88, text: 'text-xl font-bold' },
    lg: { radius: 48, stroke: 8, width: 120, text: 'text-3xl font-extrabold' },
  }[size] || { radius: 36, stroke: 6, width: 88, text: 'text-xl font-bold' };

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}>
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${dimensions.text} ${textColor}`}>
            {numericScore.toFixed(1)}
          </span>
          {size !== 'sm' && <span className="text-[10px] text-slate-400 font-medium">/ 10</span>}
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-slate-300 text-center">{label}</span>}
    </div>
  );
}
