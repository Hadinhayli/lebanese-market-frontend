
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { cartAPI, productsAPI } from '../lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Load cart from backend when authenticated, or from localStorage when not authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        // Load from backend
        try {
          setLoading(true);
          const response = await cartAPI.getItems();
          if (response.success && response.data) {
            // Transform backend cart items to frontend format
            const cartItems: CartItem[] = response.data.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: item.product
            }));
            setItems(cartItems);
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error);
          // Fallback to localStorage if backend fails
          loadCartFromLocalStorage();
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for unauthenticated users
        loadCartFromLocalStorage();
      }
    };
    
    const loadCartFromLocalStorage = async () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart: { productId: string; quantity: number }[] = JSON.parse(storedCart);
          
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
                console.warn(`Product ${item.productId} not found, removing from cart`);
                return null;
              }
            })
          );
          
          const validItems = reconstructedCart.filter((item): item is CartItem => item !== null);
          setItems(validItems);
          
          if (validItems.length !== parsedCart.length) {
            const simplifiedCart = validItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }));
            localStorage.setItem('cart', JSON.stringify(simplifiedCart));
          }
        } catch (error) {
          console.error('Failed to parse cart:', error);
          localStorage.removeItem('cart');
        }
      }
    };
    
    loadCart();
  }, [isAuthenticated]);
  
  // Save cart to localStorage for unauthenticated users whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      const simplifiedCart = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      localStorage.setItem('cart', JSON.stringify(simplifiedCart));
    }
  }, [items, isAuthenticated]);
  
  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      // Sync with backend
      try {
        await cartAPI.addItem(product.id, quantity);
        // Reload cart from backend to get updated data
        const response = await cartAPI.getItems();
        if (response.success && response.data) {
          const cartItems: CartItem[] = response.data.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product
          }));
          setItems(cartItems);
          toast({
            description: `Added ${product.name} to your cart`,
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add item to cart',
          variant: 'destructive',
        });
      }
    } else {
      // Use local state for unauthenticated users
      setItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          toast({
            description: `Updated ${product.name} quantity in your cart`,
          });
          return updatedItems;
        } else {
          toast({
            description: `Added ${product.name} to your cart`,
          });
          return [...prevItems, {
            productId: product.id,
            quantity: quantity,
            product: product
          }];
        }
      });
    }
  };
  
  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      // Sync with backend
      try {
        await cartAPI.removeItem(productId);
        // Reload cart from backend
        const response = await cartAPI.getItems();
        if (response.success && response.data) {
          const cartItems: CartItem[] = response.data.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product
          }));
          setItems(cartItems);
          const removedItem = items.find(item => item.productId === productId);
          if (removedItem) {
            toast({
              description: `Removed ${removedItem.product.name} from your cart`,
            });
          }
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove item from cart',
          variant: 'destructive',
        });
      }
    } else {
      // Use local state for unauthenticated users
      setItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.productId === productId);
        const filteredItems = prevItems.filter(item => item.productId !== productId);
        
        if (itemToRemove) {
          toast({
            description: `Removed ${itemToRemove.product.name} from your cart`,
          });
        }
        
        return filteredItems;
      });
    }
  };
  
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    if (isAuthenticated) {
      // Sync with backend
      try {
        await cartAPI.updateItem(productId, quantity);
        // Reload cart from backend
        const response = await cartAPI.getItems();
        if (response.success && response.data) {
          const cartItems: CartItem[] = response.data.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product
          }));
          setItems(cartItems);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update cart item',
          variant: 'destructive',
        });
      }
    } else {
      // Use local state for unauthenticated users
      setItems(prevItems => 
        prevItems.map(item => 
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };
  
  const clearCart = async () => {
    if (isAuthenticated) {
      // Sync with backend
      try {
        await cartAPI.clear();
        setItems([]);
        toast({
          description: "Cart has been cleared",
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to clear cart',
          variant: 'destructive',
        });
      }
    } else {
      // Use local state for unauthenticated users
      setItems([]);
      toast({
        description: "Cart has been cleared",
      });
    }
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
      totalPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};
