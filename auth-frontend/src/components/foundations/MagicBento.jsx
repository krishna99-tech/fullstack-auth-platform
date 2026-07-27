import React from 'react';
import './MagicBento.css';

export const MagicBento = ({
  children,
  className = ''
}) => {
  return (
    <div className={`card-grid bento-section ${className}`}>
      {children}
    </div>
  );
};

export const MagicBentoCard = ({
  children,
  className = '',
  color = undefined
}) => {
  const baseClassName = `magic-bento-card ${className}`;
  const cardProps = {
    className: baseClassName,
    style: {
      ...(color ? { backgroundColor: color } : {})
    }
  };

  return (
    <div {...cardProps}>
      {children}
    </div>
  );
};
