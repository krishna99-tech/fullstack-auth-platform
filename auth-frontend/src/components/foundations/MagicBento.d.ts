import * as React from "react";

export interface MagicBentoProps {
  children: React.ReactNode;
  className?: string;
  enableSpotlight?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
  disableAnimations?: boolean;
}

export interface MagicBentoCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

export const MagicBento: React.FC<MagicBentoProps>;
export const MagicBentoCard: React.FC<MagicBentoCardProps>;
