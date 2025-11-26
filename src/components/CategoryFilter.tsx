import React, { useState, useEffect } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { categoriesAPI } from '@/lib/api';
import { Category } from '@/types';

interface CategoryFilterProps {
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onSubcategoryChange: (subcategoryId: string, checked: boolean) => void;
  selectedCategories: string[];
  selectedSubcategories: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onCategoryChange,
  onSubcategoryChange,
  selectedCategories,
  selectedSubcategories
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-sm text-gray-500">No categories available</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Categories</h3>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  onCategoryChange(category.id, checked === true);
                  // Also check/uncheck all subcategories
                  category.subcategories.forEach(sub => {
                    onSubcategoryChange(sub.id, checked === true);
                  });
                }}
                className="shrink-0"
              />
              <AccordionTrigger className="flex-1 py-2 text-base hover:no-underline">
                <Label htmlFor={`category-${category.id}`} className="cursor-pointer font-medium pointer-events-none">
                  {category.name}
                </Label>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="pl-6 space-y-2">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcategory-${subcategory.id}`}
                      checked={selectedSubcategories.includes(subcategory.id)}
                      onCheckedChange={(checked) => {
                        onSubcategoryChange(subcategory.id, checked === true);
                      }}
                    />
                    <Label htmlFor={`subcategory-${subcategory.id}`} className="cursor-pointer text-sm">
                      {subcategory.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CategoryFilter;
