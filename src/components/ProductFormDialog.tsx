import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoriesAPI, productsAPI } from '@/lib/api';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    subcategoryId: '',
    stock: '',
    rating: '',
    reviewCount: '',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          image: product.image,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          stock: product.stock.toString(),
          rating: product.rating?.toString() || '0',
          reviewCount: product.reviewCount?.toString() || '0',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          categoryId: '',
          subcategoryId: '',
          stock: '0',
          rating: '0',
          reviewCount: '0',
        });
      }
    }
  }, [open, product]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount) || 0,
      };

      if (product) {
        // Update existing product
        await productsAPI.update(product.id, productData);
      } else {
        // Create new product
        await productsAPI.create(productData);
      }

      toast({
        description: product ? 'Product updated successfully' : 'Product created successfully',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Add a new product to your store'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, categoryId: value, subcategoryId: '' });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcategoryId">Subcategory *</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                  required
                  disabled={!formData.categoryId || subcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory: any) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  min="0"
                  value={formData.reviewCount}
                  onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;

