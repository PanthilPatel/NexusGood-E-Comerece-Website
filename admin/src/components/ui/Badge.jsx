import React from 'react';

const Badge = ({ variant = 'pending', children, className = '' }) => {
  const variants = {
    pending: 'bg-gold/15 text-gold border-gold/30',
    processing: 'bg-info/15 text-[#6ab0d4] border-[#6ab0d4]/30',
    shipped: 'bg-[#4a64a015] text-[#8ab0e8] border-[#8ab0e8]/30',
    delivered: 'bg-success/15 text-[#7ab898] border-[#7ab898]/30',
    cancelled: 'bg-error/15 text-[#c88888] border-[#c88888]/30',
  };

  return (
    <span className={`font-label text-[10px] px-3 py-1 rounded-[2px] border inline-flex items-center justify-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
