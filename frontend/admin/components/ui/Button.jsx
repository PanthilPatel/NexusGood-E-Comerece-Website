import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary text-white',
    outline: 'bg-transparent border border-white/10 text-[var(--text-main)] hover:text-[var(--text-heading)] hover:bg-white/5 hover:border-white/20',
    ghost: 'bg-transparent text-[var(--text-main)] hover:text-[var(--text-heading)] hover:bg-white/5',
    danger: 'bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20',
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${currentVariant} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export default Button;
