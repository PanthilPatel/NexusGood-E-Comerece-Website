import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isWished = isInWishlist(product._id);
  const outOfStock = product.stock === 0;
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      return;
    }
    if (outOfStock) return;
    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist.');
      return;
    }
    try {
      const result = await toggleWishlist(product._id);
      toast.success(result.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist.');
    } catch {
      toast.error('Failed to update wishlist.');
    }
  };

  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <Link to={`/products/${product._id}`} className="group card-hover overflow-hidden" id={`product-${product._id}`}>
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-dark-100 dark:bg-dark-800">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
            <span className="bg-dark-900/80 text-white text-sm font-semibold px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && !outOfStock && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-all"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-dark-600'}`} />
        </button>

        {/* Add to cart button — shows on hover */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="absolute bottom-3 left-3 right-3 btn-primary !py-2 text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-dark-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-dark-600 dark:text-dark-400">
              {product.avgRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <span className="text-xs text-dark-400">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-dark-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice > product.price && (
            <span className="text-sm text-dark-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
