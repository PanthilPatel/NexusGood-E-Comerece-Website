import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'md', interactive = false, onRate }) => {
  const sizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`transition-all duration-300 ${interactive ? 'hover:scale-110 active:scale-95' : 'cursor-default'}`}
          >
            <Star
              size={sizes[size]}
              className={`${
                star <= rating 
                  ? 'fill-gold text-gold' 
                  : 'text-muted fill-transparent'
              } ${interactive ? 'hover:text-gold-light' : ''}`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && !interactive && (
        <span className="font-display text-text-tertiary text-sm ml-1">
          {rating.toFixed(1)} ★
        </span>
      )}
    </div>
  );
};

export default StarRating;
