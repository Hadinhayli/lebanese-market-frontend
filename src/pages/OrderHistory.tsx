import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Package, Calendar, MapPin, Phone, Truck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OrderHistory = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const params: any = { limit: 100 };
        if (statusFilter !== 'all') {
          params.status = statusFilter.toUpperCase();
        }

        const response = await ordersAPI.getMyOrders(params);
        if (response.success && response.data) {
          const transformedOrders = response.data.map((order: any) => ({
            id: order.id,
            userId: order.userId,
            items: order.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: item.product,
            })),
            status: order.status.toLowerCase(),
            totalAmount: order.totalAmount,
            createdAt: new Date(order.createdAt),
            address: order.address,
            phoneNumber: order.phoneNumber,
          }));
          setOrders(transformedOrders);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, statusFilter, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and track your order history</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              {item.product?.image && (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium text-gray-900">
                              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                            <p className="text-sm text-gray-600 font-mono">{order.trackingNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Shipping Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Shipping Address</p>
                            <p className="text-sm text-gray-600">{order.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Phone Number</p>
                            <p className="text-sm text-gray-600">{order.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all'
                ? "You haven't placed any orders yet."
                : `No orders with status "${statusFilter}".`}
            </p>
            <Button onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default OrderHistory;

