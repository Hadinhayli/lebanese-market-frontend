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
import { categoriesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
  editingCategory?: { id: string; name: string } | null;
  editingSubcategory?: { id: string; name: string; categoryId: string } | null;
  onSuccess: () => void;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onOpenChange,
  categoryId,
  editingCategory,
  editingSubcategory,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const { toast } = useToast();

  // Set initial name when editing
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else if (editingSubcategory) {
      setName(editingSubcategory.name);
    } else {
      setName('');
    }
  }, [editingCategory, editingSubcategory, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        // Update category
        await categoriesAPI.update(editingCategory.id, name);
        toast({
          description: 'Category updated successfully',
        });
      } else if (editingSubcategory) {
        // Update subcategory
        await categoriesAPI.updateSubcategory(editingSubcategory.categoryId, editingSubcategory.id, name);
        toast({
          description: 'Subcategory updated successfully',
        });
      } else if (categoryId) {
        // Create subcategory
        await categoriesAPI.createSubcategory(categoryId, name);
        toast({
          description: 'Subcategory created successfully',
        });
      } else {
        // Create category
        await categoriesAPI.create(name);
        toast({
          description: 'Category created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
      setName('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory 
              ? 'Edit Category'
              : editingSubcategory
              ? 'Edit Subcategory'
              : categoryId 
              ? 'Create New Subcategory' 
              : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? 'Update the category name'
              : editingSubcategory
              ? 'Update the subcategory name'
              : categoryId 
              ? 'Add a new subcategory to the selected category'
              : 'Add a new product category'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={categoryId ? "Subcategory name" : "Category name"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (editingCategory || editingSubcategory ? 'Updating...' : 'Creating...')
                : (editingCategory || editingSubcategory ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;

