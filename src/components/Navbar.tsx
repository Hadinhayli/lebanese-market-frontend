
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Search, ShoppingCart, Menu, Heart } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-brand-600">YalaShop</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-gray-600 hover:text-brand-500">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-brand-500">Products</Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-brand-500">Admin</Link>
            )}
          </nav>
          
          {/* Search form - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
          
          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <Link to="/wishlist" className="text-gray-600 hover:text-brand-500 relative" title="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            )}
            <Link to={isAuthenticated ? "/profile" : "/login"} className="text-gray-600 hover:text-brand-500">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-brand-500">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-brand-500" variant="default">
                  {totalItems}
                </Badge>
              )}
            </Link>
            {isAuthenticated && (
              <Button variant="ghost" onClick={logout} className="text-sm">
                Sign Out
              </Button>
            )}
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" className="text-sm">Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-600 hover:text-brand-500">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-brand-500" variant="default">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="pt-2 pb-4 space-y-1 px-4">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Products
            </Link>
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Admin
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Wishlist
              </Link>
            )}
            <Link to={isAuthenticated ? "/profile" : "/login"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              {isAuthenticated ? 'My Account' : 'Sign In'}
            </Link>
            {isAuthenticated && (
              <button 
                onClick={logout} 
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign Out
              </button>
            )}
          </div>
          
          {/* Mobile search form */}
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
