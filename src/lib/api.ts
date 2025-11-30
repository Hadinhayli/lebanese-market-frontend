const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    // Log the error for debugging
    console.error(`API Error [${response.status}]:`, {
      endpoint,
      error,
      url: `${API_BASE_URL}${endpoint}`
    });
    // Include validation errors if available
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) => {
        const path = err.path ? err.path.join('.') : '';
        return path ? `${path}: ${err.message}` : err.message;
      }).join(', ');
      const err = new Error(errorMessages || error.message || `HTTP error! status: ${response.status}`);
      (err as any).errors = error.errors;
      throw err;
    }
    const err = new Error(error.message || `HTTP error! status: ${response.status}`);
    (err as any).errorData = error;
    throw err;
  }

  const data = await response.json();
  return data;
}

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await apiCall<{ success: boolean; data: { user: any; token: string } }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
    // Save token and user if present
    if (response.success && response.data) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response;
  },

  signin: async (email: string, password: string) => {
    const response = await apiCall<{ success: boolean; data: { user: any; token: string } }>(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  forgotPassword: async (email: string) => {
    return apiCall<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  },

  resetPassword: async (token: string, password: string) => {
    return apiCall<{ success: boolean; message: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }
    );
  },

  getGoogleAuthUrl: async () => {
    return apiCall<{ success: boolean; data: { authUrl: string } }>(
      '/auth/google/url',
      {
        method: 'GET',
      }
    );
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: {
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'price' | 'rating' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/products/${id}`);
  },

  create: async (product: {
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
    subcategoryId: string;
    stock: number;
    rating?: number;
    reviewCount?: number;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      '/products',
      {
        method: 'POST',
        body: JSON.stringify(product),
      }
    );
  },

  update: async (id: string, product: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
    subcategoryId: string;
    stock: number;
    rating: number;
    reviewCount: number;
  }>) => {
    return apiCall<{ success: boolean; data: any }>(
      `/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(product),
      }
    );
  },

  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/products/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/categories');
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/categories/${id}`);
  },

  create: async (name: string) => {
    return apiCall<{ success: boolean; data: any }>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
  },

  createSubcategory: async (categoryId: string, name: string) => {
    return apiCall<{ success: boolean; data: any }>(
      `/categories/${categoryId}/subcategories`,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
  },

  update: async (id: string, name: string) => {
    return apiCall<{ success: boolean; data: any }>(
      `/categories/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }
    );
  },

  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/categories/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  updateSubcategory: async (categoryId: string, subcategoryId: string, name: string) => {
    return apiCall<{ success: boolean; data: any }>(
      `/categories/${categoryId}/subcategories/${subcategoryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }
    );
  },

  deleteSubcategory: async (categoryId: string, subcategoryId: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/categories/${categoryId}/subcategories/${subcategoryId}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Orders API
export const ordersAPI = {
  create: async (order: {
    items: Array<{ productId: string; quantity: number }>;
    address: string;
    phoneNumber: string;
    notes?: string;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(order),
      }
    );
  },

  getMyOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders/my-orders?${queryString}` : '/orders/my-orders';
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/orders/${id}`);
  },

  updateStatus: async (id: string, status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED', trackingNumber?: string) => {
    const body: any = {};
    if (status) body.status = status;
    if (trackingNumber !== undefined) body.trackingNumber = trackingNumber;
    
    return apiCall<{ success: boolean; data: any }>(
      `/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
  },

  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/orders/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Cart API (optional - can keep frontend-only cart or sync with backend)
export const cartAPI = {
  getItems: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/cart');
  },

  addItem: async (productId: string, quantity: number = 1) => {
    return apiCall<{ success: boolean; data: any }>(
      '/cart',
      {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }
    );
  },

  updateItem: async (productId: string, quantity: number) => {
    return apiCall<{ success: boolean; data: any }>(
      `/cart/${productId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }
    );
  },

  removeItem: async (productId: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/cart/${productId}`,
      {
        method: 'DELETE',
      }
    );
  },

  clear: async () => {
    return apiCall<{ success: boolean; message: string }>(
      '/cart',
      {
        method: 'DELETE',
      }
    );
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isAdmin?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/users/${id}`);
  },

  update: async (id: string, user: {
    name?: string;
    email?: string;
    isAdmin?: boolean;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      `/users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(user),
      }
    );
  },

  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/users/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Reviews API
export const reviewsAPI = {
  getByProduct: async (productId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('productId', productId);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/reviews?${queryString}`;
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getAll: async (params?: {
    productId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reviews?${queryString}` : '/reviews';
    
    return apiCall<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/reviews/${id}`);
  },

  create: async (review: {
    productId: string;
    rating: number;
    text?: string;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      '/reviews',
      {
        method: 'POST',
        body: JSON.stringify(review),
      }
    );
  },

  update: async (id: string, review: {
    rating?: number;
    text?: string;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      `/reviews/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(review),
      }
    );
  },

  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/reviews/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// User Profile API
export const profileAPI = {
  getProfile: async () => {
    return apiCall<{ success: boolean; data: any }>('/users/profile');
  },

  updateProfile: async (profile: {
    name?: string;
    email?: string;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      '/users/profile',
      {
        method: 'PATCH',
        body: JSON.stringify(profile),
      }
    );
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    console.log('Changing password with data:', { 
      currentPassword: passwords.currentPassword ? '***' : 'missing',
      newPassword: passwords.newPassword ? '***' : 'missing',
      newPasswordLength: passwords.newPassword?.length || 0
    });
    return apiCall<{ success: boolean; message: string }>(
      '/users/profile/password',
      {
        method: 'PATCH',
        body: JSON.stringify(passwords),
      }
    );
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File): Promise<{ success: boolean; data: { url: string; filename: string } }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Wishlist API
export const wishlistAPI = {
  getAll: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/wishlist');
  },
  add: async (productId: string) => {
    return apiCall<{ success: boolean; data: any }>(
      '/wishlist',
      {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }
    );
  },
  remove: async (productId: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/wishlist/${productId}`,
      {
        method: 'DELETE',
      }
    );
  },
  check: async (productId: string) => {
    return apiCall<{ success: boolean; data: { isInWishlist: boolean } }>(
      `/wishlist/check/${productId}`
    );
  },
};

