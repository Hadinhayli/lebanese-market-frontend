import React, { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';
import ProductCard from './ProductCard';
import { Product } from '@/types';

const Featured = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getAll({
          limit: 4,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        if (response.success && response.data) {
          setFeaturedProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to load featured products:', error);
      }
    };
    
    fetchFeatured();
  }, []);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
