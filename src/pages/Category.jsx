import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Trash, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { getAllCategory, createCategory, deleteCategory } from '../services/category';
import { uploadImage } from '../services/upload';

const Category = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: categoryResponse = { data: [] }, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategory,
  });

  const categories = categoryResponse?.data || [];

  const form = useForm({
    defaultValues: {
      title: '',
      image_url: '',
    },
  });

  const handleAddClick = () => {
    form.reset({
      title: '',
      image_url: '',
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (category) => {
    form.reset({
      title: category.title,
      image_url: category.image_url,
    });
    setSelectedCategoryId(category._id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
        variant: 'destructive'
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 2MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadImage(file);
      form.setValue('image_url', uploadedUrl);
      toast({ 
        title: 'Success', 
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    form.setValue('image_url', '');
  };

  const handleSubmit = async (data) => {
    try {
      const categoryData = {
        title: data.title.trim(),
        image_url: data.image_url.trim(),
      };

      let response;
      if (isEditing && selectedCategoryId) {
        // response = await updateCategory(selectedCategoryId, categoryData);
      } else {
        response = await createCategory(categoryData);
      }

      if (response.statusCode === 400) {
        toast({
          title: 'Something went wrong',
          description: response.data.message || 'Failed to process category',
          variant: 'destructive'
        });
        return;
      }

      if (response.status === 200 || response.statusCode === 200) {
        toast({
          title: isEditing ? 'Category Updated' : 'Category Added',
          description: `${data.title} ${isEditing ? 'updated' : 'added'} successfully.`,
          variant: 'success'
        });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedCategoryId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategoryId) return;
    try {
      const response = await deleteCategory(selectedCategoryId);
      if (response.statusCode === 200) {
        toast({ 
          title: 'Deleted', 
          description: 'Category deleted successfully.',
          variant: 'success'
        });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to delete category', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Delete failed', 
        variant: 'destructive' 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'image_url',
      cell: (row) => (
        <img
          src={row?.image_url || '/placeholder-image.jpg'}
          alt="Category"
          className="h-16 w-16 rounded-md object-cover"
        />
      ),
    },
    { 
      header: 'Name', 
      accessor: 'title',
      cell: (row) => <span className="font-medium">{row.title}</span>
    },
    {
      header: 'Actions',
      accessor: '',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(row)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(row._id)}
                className="h-8 w-8 p-0 hover:bg-red-100"
              >
                <Trash className="h-4 w-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <DataTable
          data={categories}
          columns={columns}
          searchable={true}
          searchField="title"
          isLoading={isLoading}
          noDataMessage="No categories found"
        />
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter category name"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image</FormLabel>
                    {field.value ? (
                      <div className="relative">
                        <img
                          src={field.value}
                          alt="Category preview"
                          className="h-40 w-full rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={removeImage}
                        >
                          <span className="sr-only">Remove image</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <Label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-4 text-gray-500"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP (MAX. 2MB)
                            </p>
                          </div>
                          <Input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </Label>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading || form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditing ? (
                    'Update Category'
                  ) : (
                    'Add Category'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Category;