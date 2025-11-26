import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Featured from '@/components/Featured';
import Footer from '@/components/Footer';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Category, Product } from '@/types';

const Index = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch new arrivals
        const productsResponse = await productsAPI.getAll({
          limit: 4,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        if (productsResponse.success && productsResponse.data) {
          setNewArrivals(productsResponse.data);
        }

        // Fetch categories
        const categoriesResponse = await categoriesAPI.getAll();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animation-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Shop the Best Products from Lebanon</h1>
              <p className="text-lg md:text-xl opacity-90">Discover quality electronics, home goods, fashion, and more with reliable delivery across Lebanon.</p>
              <div className="pt-4">
                <Link to="/products">
                  <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070&auto=format&fit=crop"
                alt="Lebanese marketplace"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {category.subcategories.length} subcategories
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No categories available</p>
          )}
        </div>
      </section>
      
      {/* Featured Products Section */}
      <Featured />
      
      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Why Choose Us Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose LebanonShop?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-500">We carefully select all our products to ensure the highest quality.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-500">Get your orders delivered quickly across all regions in Lebanon.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Cash on Delivery</h3>
              <p className="text-gray-500">Pay for your order when you receive it at your doorstep.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-12 bg-brand-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">Stay updated with the latest products and exclusive offers.</p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-l-md text-gray-900 focus:outline-none"
            />
            <Button className="rounded-l-none bg-gray-800 hover:bg-gray-900">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
