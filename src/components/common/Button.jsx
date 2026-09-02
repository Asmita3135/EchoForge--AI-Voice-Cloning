import React from 'react';

/**
 * Accessible button component supporting variants, sizes, loading state, and style overrides.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',     // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',             // 'sm' | 'md' | 'lg'
  disabled = false,
  isLoading = false,
  type = 'button',
  icon: Icon = null,
  className = '',
  ariaLabel = undefined,
  style = {},
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      className={`ef-btn ef-btn-${variant} ef-btn-${size} ${className}`}
      style={style}
    >
      {isLoading ? (
        <>
          <span className="spinner-sm" aria-hidden="true" />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  );
}
