import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">
          {label}
        </label>
      )}
      <input
        className={`input-field w-full ${error ? 'border-accent/50' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-accent text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
};

export default Input;
