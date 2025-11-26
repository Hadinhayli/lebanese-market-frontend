import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { wishlistAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, navigate, toast]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      if (response.success && response.data) {
        setWishlistItems(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await wishlistAPI.remove(productId);
      if (response.success) {
        toast({ description: 'Removed from wishlist' });
        // Remove from local state
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from wishlist',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({ description: 'Added to cart' });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <p className="text-gray-500">Loading wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Your saved products</p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Start adding products you love to your wishlist!</p>
              <Link to="/products">
                <Button className="bg-brand-500 hover:bg-brand-600">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const product = item.product;
                return (
                  <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    <Link to={`/product/${product.id}`} className="overflow-hidden flex-shrink-0 relative">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-48 w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(product.id);
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                          aria-label="Remove from wishlist"
                        >
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
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
                        <span className="font-bold text-lg whitespace-nowrap">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="bg-brand-500 hover:bg-brand-600 flex-1 sm:flex-none"
                          >
                            <ShoppingCart className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Add to Cart</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFromWishlist(product.id);
                            }}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;

