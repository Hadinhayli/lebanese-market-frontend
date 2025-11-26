
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Product, Review } from '@/types';
import ReviewForm from '@/components/ReviewForm';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productsAPI.getById(id);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setProduct(null);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load product',
          variant: 'destructive',
        });
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setReviewsLoading(true);
        const response = await reviewsAPI.getByProduct(id, { limit: 50 });
        if (response.success && response.data) {
          setReviews(response.data);
          
          // Check if current user has a review
          if (user) {
            const review = response.data.find((r: Review) => r.userId === user.id);
            setUserReview(review || null);
          }
        }
      } catch (error: any) {
        console.error('Failed to load reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [id, user]);

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    // Refresh product to get updated rating/reviewCount
    if (id) {
      try {
        const response = await productsAPI.getById(id);
        if (response.success && response.data) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Failed to refresh product:', error);
      }
    }
    // Refresh reviews
    if (id) {
      try {
        const response = await reviewsAPI.getByProduct(id, { limit: 50 });
        if (response.success && response.data) {
          setReviews(response.data);
          if (user) {
            const review = response.data.find((r: Review) => r.userId === user.id);
            setUserReview(review || null);
          }
        }
      } catch (error) {
        console.error('Failed to refresh reviews:', error);
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await reviewsAPI.delete(reviewId);
      toast({
        title: 'Review deleted',
        description: 'Your review has been deleted',
      });
      handleReviewSubmitted();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading product...</p>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    if (isAuthenticated) {
      addToCart(product, 1);
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to="/products" className="text-brand-600 hover:text-brand-500">
            ← Back to products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
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
                <span className="ml-2 text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            </div>
            
            <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock > 0 && (
                <span className="text-gray-500">
                  ({product.stock} {product.stock === 1 ? 'item' : 'items'} left)
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart} 
                className="w-full bg-brand-500 hover:bg-brand-600"
                disabled={!isAuthenticated || product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center">
                  <Link to="/login" className="text-brand-600 hover:underline">
                    Sign in
                  </Link> to add items to your cart
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Information Tabs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews ({reviews.length})</h2>
          
          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
                      </div>
                      <span className="ml-2 text-gray-600 font-medium">{review.userName}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      {user && review.userId === user.id && (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserReview(review);
                              setShowReviewForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.text && (
                    <p className="text-gray-600">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
          
          {/* Review Form */}
          {isAuthenticated && (
            <div className="mt-8">
              {showReviewForm ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {userReview ? 'Edit Your Review' : 'Leave a Review'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReviewForm(false);
                        setUserReview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <ReviewForm
                    productId={product.id}
                    onReviewSubmitted={handleReviewSubmitted}
                    existingReview={userReview}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  {userReview ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">You've already reviewed this product</h3>
                      <p className="mb-4 text-gray-600">You can edit or delete your review above.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">Share your thoughts</h3>
                      <p className="mb-4 text-gray-600">Help other customers by writing a review.</p>
                      <Button
                        className="bg-brand-500 hover:bg-brand-600"
                        onClick={() => setShowReviewForm(true)}
                      >
                        Write a Review
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Want to leave a review?</h3>
              <p className="mb-4 text-gray-600">Sign in to share your thoughts about this product.</p>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;
