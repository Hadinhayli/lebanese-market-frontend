import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import PriceRangeFilter from '@/components/PriceRangeFilter';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { value: 'rating', label: 'Highest Rating', sortBy: 'rating', sortOrder: 'desc' },
  { value: 'newest', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const { toast } = useToast();
  
  // Update search query when URL changes
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const selectedSort = sortOptions.find(opt => opt.value === sortOrder) || sortOptions[3];
        
        const params: any = {
          sortBy: selectedSort.sortBy,
          sortOrder: selectedSort.sortOrder,
          limit: 100,
        };
        
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        
        if (selectedCategories.length > 0) {
          params.categoryId = selectedCategories[0];
        }
        
        if (selectedSubcategories.length > 0) {
          params.subcategoryId = selectedSubcategories[0];
        }
        
        if (minPrice !== undefined) {
          params.minPrice = minPrice;
        }
        
        if (maxPrice !== undefined) {
          params.maxPrice = maxPrice;
        }
        
        const response = await productsAPI.getAll(params);
        
        if (response.success) {
          setProducts(response.data || []);
          
          // Update price range if we have products
          if (response.data && response.data.length > 0) {
            const prices = response.data.map((p: Product) => p.price);
            setPriceRange({
              min: Math.min(...prices),
              max: Math.max(...prices),
            });
          }
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCategories, selectedSubcategories, minPrice, maxPrice, sortOrder, searchQuery]);
  
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      if (checked && !prev.includes(categoryId)) {
        return [categoryId]; // Only allow one category at a time for now
      } else if (!checked && prev.includes(categoryId)) {
        return [];
      }
      return prev;
    });
  };
  
  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    setSelectedSubcategories(prev => {
      if (checked && !prev.includes(subcategoryId)) {
        return [subcategoryId]; // Only allow one subcategory at a time for now
      } else if (!checked && prev.includes(subcategoryId)) {
        return [];
      }
      return prev;
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        
        <div className="md:hidden mb-4">
          <Button 
            onClick={() => setFiltersOpen(!filtersOpen)} 
            variant="outline"
            className="w-full"
          >
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`w-full md:w-72 space-y-6 ${filtersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-4 rounded-lg shadow">
              <CategoryFilter
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
              />
              
              <Separator className="my-6" />
              
              <PriceRangeFilter
                minPrice={minPrice || priceRange.min}
                maxPrice={maxPrice || priceRange.max}
                onMinPriceChange={(val) => setMinPrice(val === priceRange.min ? undefined : val)}
                onMaxPriceChange={(val) => setMaxPrice(val === priceRange.max ? undefined : val)}
                absoluteMin={priceRange.min}
                absoluteMax={priceRange.max}
              />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">
                {loading ? 'Loading...' : `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`}
              </p>
              
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your filters</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSubcategories([]);
                    setMinPrice(undefined);
                    setMaxPrice(undefined);
                    setSortOrder('newest');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Products;
