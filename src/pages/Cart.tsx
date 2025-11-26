
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ordersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1);
  
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to checkout",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (checkoutStep === 1) {
      // Move to shipping information
      setCheckoutStep(2);
      return;
    }
    
    // Place order
    if (!address.trim() || !phoneNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your shipping address and phone number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Validate cart is not empty
      if (items.length === 0) {
        toast({
          title: "Error",
          description: "Your cart is empty",
          variant: "destructive"
        });
        return;
      }

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: parseInt(String(item.quantity), 10), // Ensure quantity is an integer
        })),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        notes: notes?.trim() || undefined,
      };

      // Validate data before sending
      if (orderData.address.length < 10) {
        toast({
          title: "Error",
          description: "Address must be at least 10 characters long",
          variant: "destructive"
        });
        return;
      }

      if (orderData.phoneNumber.length < 8) {
        toast({
          title: "Error",
          description: "Phone number must be at least 8 characters long",
          variant: "destructive"
        });
        return;
      }

      // Place order via API
      const response = await ordersAPI.create(orderData);
      
      if (response.success) {
        toast({
          title: "Order placed successfully!",
          description: "Your order has been placed and will be processed soon.",
        });
        
        clearCart();
        navigate('/');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error: any) {
      let errorMessage = error.message || "Failed to place order. Please try again.";
      
      // Handle authentication errors
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "You must be logged in to place an order. Please sign in and try again.";
        navigate('/login');
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
          <p className="mb-8">Please sign in to view your cart and checkout.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
        
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
        
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {checkoutStep === 1 ? 'Shopping Cart' : 'Checkout'}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {checkoutStep === 1 && (
              <>
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6">
                    <h2 className="text-xl font-medium mb-4">Cart Items ({totalItems})</h2>
                    <div className="divide-y">
                      {items.map(item => (
                        <CartItem key={item.productId} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  <Link to="/products">
                    <Button variant="ghost">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {checkoutStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <Textarea
                      id="address"
                      placeholder="Full address including building, street, area, and city"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="resize-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Phone number for delivery contact"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions for your order"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                </form>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutStep(1)}
                  >
                    Back to Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$0.00</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  <Button
                    className="w-full bg-brand-500 hover:bg-brand-600"
                    onClick={handleCheckout}
                  >
                    {checkoutStep === 1 ? 'Proceed to Checkout' : 'Place Order (Cash on Delivery)'}
                  </Button>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                  <p>Cash on delivery only</p>
                  <p className="mt-2">Estimated delivery: 2-4 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
