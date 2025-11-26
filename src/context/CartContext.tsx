
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { productsAPI } from '../lib/api';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on initial load
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart: { productId: string; quantity: number }[] = JSON.parse(storedCart);
          
          // Only try to load cart if we have items
          if (parsedCart.length === 0) {
            return;
          }
          
          // Reconstruct cart items with product data from API
          const reconstructedCart: CartItem[] = await Promise.all(
            parsedCart.map(async (item) => {
              try {
                const response = await productsAPI.getById(item.productId);
                if (response.success && response.data) {
                  return {
                    productId: item.productId,
                    quantity: item.quantity,
                    product: response.data
                  };
                }
                return null;
              } catch (error) {
                // Silently fail - product might not exist anymore
                console.warn(`Product ${item.productId} not found, removing from cart`);
                return null;
              }
            })
          );
          
          // Filter out null values (products that couldn't be loaded)
          const validItems = reconstructedCart.filter((item): item is CartItem => item !== null);
          setItems(validItems);
          
          // Update localStorage with valid items only
          if (validItems.length !== parsedCart.length) {
            const simplifiedCart = validItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }));
            localStorage.setItem('cart', JSON.stringify(simplifiedCart));
          }
        } catch (error) {
          console.error('Failed to parse cart:', error);
          // Clear invalid cart data
          localStorage.removeItem('cart');
        }
      }
    };
    
    loadCart();
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const simplifiedCart = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(simplifiedCart));
  }, [items]);
  
  const addToCart = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        // Show toast after state update
        setTimeout(() => {
          toast({
            description: `Updated ${product.name} quantity in your cart`,
          });
        }, 0);
        
        return updatedItems;
      } else {
        // Add new item
        // Show toast after state update
        setTimeout(() => {
          toast({
            description: `Added ${product.name} to your cart`,
          });
        }, 0);
        
        return [...prevItems, {
          productId: product.id,
          quantity: quantity,
          product: product
        }];
      }
    });
  };
  
  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.productId === productId);
      const filteredItems = prevItems.filter(item => item.productId !== productId);
      
      // Show toast after state update
      if (itemToRemove) {
        setTimeout(() => {
          toast({
            description: `Removed ${itemToRemove.product.name} from your cart`,
          });
        }, 0);
      }
      
      return filteredItems;
    });
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    // Show toast after state update
    setTimeout(() => {
      toast({
        description: "Cart has been cleared",
      });
    }, 0);
  };
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );
  
  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
