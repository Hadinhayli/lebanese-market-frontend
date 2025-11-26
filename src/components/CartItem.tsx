
import React from 'react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };
  
  const handleRemove = () => {
    removeFromCart(item.productId);
  };
  
  return (
    <div className="flex py-6 border-b">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.product.name}</h3>
            <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.product.description}</p>
        </div>
        
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Qty</span>
            <div className="flex items-center border rounded">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={decreaseQuantity}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-2">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={increaseQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
