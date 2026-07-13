import React from 'react';

interface SyncRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function SyncRing({ percentage, size = 64, strokeWidth = 5, label = "SYNC" }: SyncRingProps) {
  const rounded = Math.round(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, rounded)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-border-subtle"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-sync-green transition-all duration-500 ease-out"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px var(--color-sync-green))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold font-mono-tech text-sync-green leading-none">
            {rounded}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[9px] font-bold font-orbitron tracking-widest text-text-muted mt-1 uppercase text-center leading-none">
          {label}
        </span>
      )}
    </div>
  );
}
