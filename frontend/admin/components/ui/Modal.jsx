import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-[400px]',
    md: 'max-w-[600px]',
    lg: 'max-w-[900px]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative w-full ${sizes[size]} bg-charcoal border border-muted shadow-2xl animate-scaleIn overflow-hidden rounded-sm`}>
        <div className="flex items-center justify-between p-6 border-b border-muted">
          <h3 className="font-display text-2xl text-text-primary tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
