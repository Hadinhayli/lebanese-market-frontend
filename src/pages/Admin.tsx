
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { productsAPI, categoriesAPI, ordersAPI, usersAPI } from '@/lib/api';
import { Product, Order, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ProductFormDialog from '@/components/ProductFormDialog';
import CategoryFormDialog from '@/components/CategoryFormDialog';


const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string; name: string; categoryId: string } | null>(null);
  
  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch products, categories, orders, and users
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse, usersResponse] = await Promise.all([
          productsAPI.getAll({ limit: 100 }), // Reduced limit to avoid validation issues
          categoriesAPI.getAll(),
          ordersAPI.getAll({ limit: 100 }),
          usersAPI.getAll({ limit: 100 }),
        ]);
        
        if (productsResponse.success && productsResponse.data) {
          setProductsList(productsResponse.data);
        } else {
          console.error('Products response:', productsResponse);
        }
        
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategoriesList(categoriesResponse.data);
        } else {
          console.error('Categories response:', categoriesResponse);
        }

        if (ordersResponse.success && ordersResponse.data) {
          // Transform backend order format to frontend format
          const transformedOrders = ordersResponse.data.map((order: any) => ({
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
            user: order.user, // Include user info if available
          }));
          setOrdersList(transformedOrders);
        } else {
          console.error('Orders response:', ordersResponse);
        }

        if (usersResponse.success && usersResponse.data) {
          setUsersList(usersResponse.data);
        } else {
          console.error('Users response:', usersResponse);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, isAdmin, toast]);
  
  // Calculate monthly revenue
  const monthlyRevenue = ordersList
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Calculate monthly orders
  const monthlyOrders = ordersList.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && 
           orderDate.getFullYear() === now.getFullYear();
  }).length;
  
  // Calculate top selling items
  const topSellingItems: { [key: string]: number } = {};
  ordersList.forEach(order => {
    order.items.forEach(item => {
      if (topSellingItems[item.productId]) {
        topSellingItems[item.productId] += item.quantity;
      } else {
        topSellingItems[item.productId] = item.quantity;
      }
    });
  });
  
  const topSellingItemsList = Object.entries(topSellingItems)
    .map(([id, quantity]) => ({
      product: productsList.find(p => p.id === id) as Product,
      quantity
    }))
    .filter(item => item.product) // Filter out undefined products
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Handle order status change
  const handleStatusChange = async (orderId: string, status: Order['status'], trackingNumber?: string) => {
    try {
      // Convert frontend status to backend status format
      const backendStatus = status.toUpperCase() as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
      
      const response = await ordersAPI.updateStatus(orderId, backendStatus, trackingNumber);
      
      if (response.success) {
        // Update local state
        setOrdersList(prev => 
          prev.map(order => 
            order.id === orderId ? { 
              ...order, 
              status,
              trackingNumber: trackingNumber || order.trackingNumber 
            } : order
          )
        );
        
        toast({
          description: 'Order updated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      const response = await ordersAPI.delete(orderId);
      if (response.success) {
        setOrdersList(prev => prev.filter(order => order.id !== orderId));
        toast({
          description: 'Order deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await productsAPI.delete(productId);
      if (response.success) {
        setProductsList(prev => prev.filter(product => product.id !== productId));
        toast({
          description: 'Product deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  // Handle create/edit product
  const handleOpenProductDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setProductDialogOpen(true);
  };

  const handleProductSaved = async () => {
    // Refresh products list
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      if (response.success && response.data) {
        setProductsList(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const handleCategorySaved = async () => {
    // Refresh categories list
    try {
      const response = await categoriesAPI.getAll();
      if (response.success && response.data) {
        setCategoriesList(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
    // Reset editing states
    setEditingCategory(null);
    setEditingSubcategory(null);
  };

  const handleEditCategory = (category: { id: string; name: string }) => {
    setEditingCategory(category);
    setSelectedCategoryForSubcategory('');
    setEditingSubcategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: { id: string; name: string }, categoryId: string) => {
    setEditingSubcategory({ ...subcategory, categoryId });
    setEditingCategory(null);
    setSelectedCategoryForSubcategory('');
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all its subcategories. Products in this category will need to be reassigned.')) {
      return;
    }
    
    try {
      const response = await categoriesAPI.delete(categoryId);
      if (response.success) {
        setCategoriesList(prev => prev.filter(cat => cat.id !== categoryId));
        toast({
          description: 'Category deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? Products in this subcategory will need to be reassigned.')) {
      return;
    }
    
    try {
      const response = await categoriesAPI.deleteSubcategory(categoryId, subcategoryId);
      if (response.success) {
        setCategoriesList(prev => 
          prev.map(cat => 
            cat.id === categoryId
              ? {
                  ...cat,
                  subcategories: cat.subcategories.filter((sub: any) => sub.id !== subcategoryId)
                }
              : cat
          )
        );
        toast({
          description: 'Subcategory deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subcategory',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await usersAPI.delete(userId);
      if (response.success) {
        setUsersList(prev => prev.filter(user => user.id !== userId));
        toast({
          description: 'User deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  // Handle update user role
  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const response = await usersAPI.update(userId, { isAdmin: !currentIsAdmin });
      if (response.success) {
        setUsersList(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, isAdmin: !currentIsAdmin } : user
          )
        );
        toast({
          description: `User ${!currentIsAdmin ? 'promoted to' : 'removed from'} admin successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button 
            className="mt-4 md:mt-0 bg-brand-500 hover:bg-brand-600"
            onClick={() => handleOpenProductDialog()}
          >
            Add New Product
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Total revenue this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-3xl font-bold">${monthlyRevenue.toFixed(2)}</h3>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Monthly Orders</CardTitle>
                  <CardDescription>Total orders this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-3xl font-bold">{monthlyOrders}</h3>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-3xl font-bold">{usersList.length}</h3>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {topSellingItemsList.length > 0 ? (
                    <div className="space-y-4">
                      {topSellingItemsList.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img 
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{product.name}</h4>
                            <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                          </div>
                          <div className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded">
                            {quantity} sold
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sales data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersList.length > 0 ? (
                    <div className="space-y-4">
                      {ordersList.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {order.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="font-medium">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent orders</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Manage your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Loading products...
                          </td>
                        </tr>
                      ) : productsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        productsList.map((product) => {
                          const category = categoriesList.find(c => c.id === product.categoryId);
                        return (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img className="h-10 w-10 rounded object-cover" src={product.image} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{category?.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mr-2"
                                onClick={() => handleOpenProductDialog(product)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Category Management</CardTitle>
                    <CardDescription>Manage product categories and subcategories</CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedCategoryForSubcategory('');
                        setEditingCategory(null);
                        setEditingSubcategory(null);
                        setCategoryDialogOpen(true);
                      }}
                    >
                      Add Category
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading categories...</p>
                ) : categoriesList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No categories found</p>
                    <Button onClick={() => {
                      setSelectedCategoryForSubcategory('');
                      setCategoryDialogOpen(true);
                    }}>
                      Create First Category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categoriesList.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory({ id: category.id, name: category.name })}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryForSubcategory(category.id);
                                setEditingCategory(null);
                                setEditingSubcategory(null);
                                setCategoryDialogOpen(true);
                              }}
                            >
                              Add Subcategory
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        {category.subcategories && category.subcategories.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {category.subcategories.map((subcategory: any) => (
                              <div
                                key={subcategory.id}
                                className="bg-gray-50 px-3 py-2 rounded text-sm flex justify-between items-center"
                              >
                                <span>{subcategory.name}</span>
                                <div className="flex space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleEditSubcategory(subcategory, category.id)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No subcategories</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tracking
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            Loading orders...
                          </td>
                        </tr>
                      ) : ordersList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        ordersList.map((order) => {
                          // Get user info from order if available, otherwise use userId
                          const userName = (order as any).user?.name || `User ${order.userId.substring(0, 8)}`;
                          const userEmail = (order as any).user?.email || '';
                          return (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.createdAt.toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{userName}</div>
                                {userEmail && (
                                  <div className="text-xs text-gray-500">{userEmail}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ${order.totalAmount.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  className="text-sm rounded border border-gray-300 py-1 px-2"
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(
                                    order.id, 
                                    e.target.value as Order['status']
                                  )}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  placeholder="Tracking #"
                                  value={order.trackingNumber || ''}
                                  onChange={(e) => {
                                    const trackingNumber = e.target.value.trim() || undefined;
                                    handleStatusChange(order.id, order.status, trackingNumber);
                                  }}
                                  className="text-sm rounded border border-gray-300 py-1 px-2 w-32"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="ml-2"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : usersList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        usersList.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.isAdmin 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isAdmin ? 'Admin' : 'Customer'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                >
                                  {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
        onSuccess={handleProductSaved}
      />

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setEditingSubcategory(null);
            setSelectedCategoryForSubcategory('');
          }
        }}
        categoryId={selectedCategoryForSubcategory || undefined}
        editingCategory={editingCategory}
        editingSubcategory={editingSubcategory}
        onSuccess={handleCategorySaved}
      />
    </div>
  );
};

export default Admin;
