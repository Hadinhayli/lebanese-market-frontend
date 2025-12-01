import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { wishlistAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.check(product.id);
      if (response.success) {
        setIsInWishlist(response.data.isInWishlist);
      }
    } catch (error) {
      // Silently fail - user might not be authenticated
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'destructive',
      });
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(product.id);
        setIsInWishlist(false);
        toast({ description: 'Removed from wishlist' });
      } else {
        await wishlistAPI.add(product.id);
        setIsInWishlist(true);
        toast({ description: 'Added to wishlist' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <Link to={`/product/${product.id}`} className="overflow-hidden flex-shrink-0 relative">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover object-center hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart 
              className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 flex-shrink-0 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3.167l1.753 3.555 3.919.569-2.836 2.764.669 3.906L10 12.19 6.495 13.96l.669-3.906-2.836-2.764 3.919-.569L10 3.167z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
              <span className="ml-1 text-xs text-gray-500 whitespace-nowrap">({product.reviewCount})</span>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="font-bold text-lg whitespace-nowrap flex-shrink-0">${product.price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-brand-500 hover:bg-brand-600 w-full sm:w-auto sm:min-w-[140px] flex-shrink-0 whitespace-nowrap"
            disabled={!isAuthenticated}
          >
            <ShoppingCart className="h-4 w-4 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
