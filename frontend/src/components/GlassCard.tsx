import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: string;
  glow?: boolean;
  gradient?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false, gradient, style, ...props }) => (
  <div
    className={`glass-card ${glow ? 'glass-card-active animate-pulse-glow' : ''} ${className}`}
    style={{
      ...(gradient ? { background: gradient } : {}),
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export default GlassCard;
