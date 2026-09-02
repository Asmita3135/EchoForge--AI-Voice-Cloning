import React from 'react';

/**
 * Surface card component for holding forensic data and form sections.
 */
export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`ef-card ${className}`} style={style}>
      {children}
    </div>
  );
}
