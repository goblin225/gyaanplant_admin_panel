import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Trash, Upload, Plus, X, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { getAllCourses, createCourse, deleteCourse, editCourse } from '../services/course';
import { getAllCategory } from '../services/category';
import { getRoles } from '../services/user';
import { uploadImage } from '../services/upload';

const categoryOptions = [
    { code: "education", name: "Education" },
    { code: "technology", name: "Technology" },
    { code: "finance", name: "Finance" },
    { code: "health", name: "Health" },
];

const Courses = () => {

    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const queryClient = useQueryClient();

    const { data: courseResponse = { data: [] }, isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCourses,
    });

    const { data: categoryResponse = { data: [] }, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getAllCategory,
    });

    const { data: rolesResponse = { data: [] }, isLoading: isRolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
    });

    const courses = courseResponse?.data || [];
    const category = categoryResponse?.data || [];
    const roles = rolesResponse?.data || [];

    const form = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: "",
            role: "",
            duration: '',
            thumbnail: '',
            price: 0,
            isActive: true,
            lessons: []
        },
    });

    const handleViewCourse = (course) => {
        setSelectedCourse(course);
        setIsViewing(true);
    };

    const handleAddClick = () => {
        form.reset({
            title: '',
            description: '',
            category: categoryOptions[0].code,
            duration: '',
            thumbnail: '',
            price: 0,
            isActive: true,
            lessons: []
        });
        setIsEditing(false);
        setSelectedCourse(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (course) => {
        form.reset({
            title: course.title,
            description: course.description,
            category: course.category,
            duration: course.duration,
            thumbnail: course.thumbnail,
            price: course.price,
            isActive: course.isActive,
            lessons: course.lessons || []
        });
        setSelectedCourse(course);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadedUrl = await uploadImage(file);
            form.setValue('thumbnail', uploadedUrl);
            toast({ title: 'Success', description: 'Image uploaded successfully' });
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
        form.setValue('thumbnail', '');
    };

    const handleSubmit = async (data) => {
        try {
            const courseData = {
                title: data.title.trim(),
                description: data.description.trim(),
                category: data.category,
                role: data.role,
                duration: data.duration,
                thumbnail: data.thumbnail.trim(),
                price: Number(data.price),
                isActive: data.isActive,
                lessons: (data.lessons || []).map((lesson) => ({
                    title: lesson.title.trim(),
                    videoUrl: lesson.videoUrl.trim(),
                    description: lesson.description.trim(),
                    duration: lesson.duration.trim(),
                })),
            };

            let response;
            if (isEditing && selectedCourse) {
                response = await editCourse(selectedCourse._id, courseData);
            } else {
                response = await createCourse(courseData);
            }

            // Handle 400 errors
            if (response.statusCode === 400) {
                toast({
                    title: 'Something went wrong',
                    description: response.data?.message || 'Failed to process course',
                    variant: 'destructive'
                });
                return;
            }

            // Handle success
            if (response.status === 200 || response.statusCode === 200) {
                toast({
                    title: isEditing ? 'Course Updated' : 'Course Added',
                    description: `${data.title} ${isEditing ? 'updated' : 'added'} successfully.`,
                });
                queryClient.invalidateQueries({ queryKey: ['courses'] });
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
        setSelectedCourseId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedCourseId) return;
        try {
            const response = await deleteCourse(selectedCourseId);
            if (response.statusCode === 200) {
                toast({ title: 'Deleted', description: 'Course deleted successfully.' });
                queryClient.invalidateQueries({ queryKey: ['courses'] });
            } else {
                toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedCourseId(null);
        }
    };

    const columns = [
        {
            header: 'Thumbnail',
            accessor: 'thumbnail',
            cell: (row) => (
                <img
                    src={row?.thumbnail || '/default-course.png'}
                    alt="Thumbnail"
                    className="h-20 w-40 rounded-md object-cover"
                />
            ),
        },
        { header: 'Title', accessor: 'title' },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Category',
            accessor: 'category',
            cell: (row) => (
                <span className="text-sm font-bold text-blue-700">
                    {categoryOptions.find(cat => cat.code === row?.category)?.name || row?.category}
                </span>
            ),
        },
        { header: 'Duration', accessor: 'duration' },
        {
            header: 'Price',
            accessor: 'price',
            cell: (row) => `₹${row?.price}`
        },
        {
            header: 'Status',
            accessor: 'isActive',
            cell: (row) =>
                row?.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                ),
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="text-right flex items-center justify-center gap-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <Eye
                                onClick={() => handleViewCourse(row)}
                                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-500"
                            />
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Edit
                                onClick={() => handleEditClick(row)}
                                className="h-4 w-4 text-blue-800 cursor-pointer hover:text-blue-600"
                            />
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Trash
                                onClick={() => handleDeleteClick(row?._id)}
                                className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                            />
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const getYouTubeEmbedUrl = (url) => {
        try {
            const videoId = url.includes("youtu.be")
                ? url.split("/").pop()?.split("?")[0]
                : new URL(url).searchParams.get("v");

            return `https://www.youtube.com/embed/${videoId}`;
        } catch (err) {
            return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Course Management</h1>
                <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={courses}
                    columns={columns}
                    searchable={true}
                    searchField="title"
                    isLoading={isLoading}
                />
            </Card>

            {/* Add/Edit Course Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Course Title"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Course Description"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. 10 hours"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === "" ? "" : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {category?.map((cat) => (
                                                        <SelectItem key={cat?.title} value={cat?.title}>
                                                            {cat?.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {roles?.map((role) => (
                                                        <SelectItem key={role?.name} value={role?.name}>
                                                            {role?.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <Label>Thumbnail Image *</Label>
                                    <div className="flex items-center gap-4">
                                        {form.watch('thumbnail') ? (
                                            <div className="relative">
                                                <img
                                                    src={form.watch('thumbnail')}
                                                    alt="Course thumbnail"
                                                    className="h-32 w-48 rounded-md object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 p-1 rounded-full"
                                                    onClick={removeImage}
                                                    disabled={isUploading}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed rounded-md p-4 w-full">
                                                <Label htmlFor="imageUpload" className="flex flex-col items-center gap-2 cursor-pointer">
                                                    <Upload className="h-6 w-6" />
                                                    <span>Upload Image</span>
                                                    {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                                                </Label>
                                                <Input
                                                    id="imageUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <Label>Lessons</Label>
                                    <div className="space-y-4">
                                        {form.watch('lessons')?.map((lesson, index) => (
                                            <div key={index} className="border p-4 rounded-lg space-y-4">
                                                <FormField
                                                    name={`lessons.${index}.title`}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Lesson Title</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Lesson title" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`lessons.${index}.videoUrl`}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Video URL</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://youtu.be/..." {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`lessons.${index}.description`}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Lesson Description</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Lesson description" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`lessons.${index}.duration`}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Duration</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. 5:12" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const currentLessons = form.getValues('lessons');
                                                        form.setValue('lessons', currentLessons.filter((_, i) => i !== index));
                                                    }}
                                                >
                                                    Remove Lesson
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const currentLessons = form.getValues('lessons') || [];
                                                form.setValue('lessons', [
                                                    ...currentLessons,
                                                    { title: '', videoUrl: '', description: '', duration: '' }
                                                ]);
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Lesson
                                        </Button>
                                    </div>
                                </div>
                            </div>

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
                                    className="bg-green-600 hover:bg-green-800"
                                    disabled={isUploading || form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : (
                                        isEditing ? 'Update Course' : 'Add Course'
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
                            Are you sure you want to delete this course? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-800" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Course Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Course Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedCourse?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCourse && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Title</Label>
                                        <p className="text-gray-700">{selectedCourse?.title}</p>
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <p className="whitespace-pre-line text-gray-700">{selectedCourse.description}</p>
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <p className="font-bold text-blue-600">
                                            {categoryOptions.find(cat => cat.code === selectedCourse?.category)?.name || selectedCourse?.category}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Duration</Label>
                                            <p className="text-gray-700">
                                                {selectedCourse?.duration}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Price</Label>
                                            <p className="text-gray-700">
                                                ₹{selectedCourse?.price}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Role</Label>
                                            <p className="text-gray-700">
                                                {selectedCourse?.role}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <div className="mt-1">
                                                {selectedCourse?.isActive ? (
                                                    <Badge
                                                        variant="success"
                                                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            <span>Active</span>
                                                        </div>
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                                            <span>Inactive</span>
                                                        </div>
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Thumbnail</Label>
                                        <img
                                            src={selectedCourse?.thumbnail || '/default-course.png'}
                                            alt={selectedCourse?.title}
                                            className="h-48 w-full object-cover rounded-md mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="font-bold text-lg">Lessons</Label>
                                <div className="mt-4 space-y-3">
                                    {selectedCourse?.lessons?.map((item, index) => (
                                        <div key={index} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-lg">{index + 1}.</span>
                                                        <div>
                                                            <p className="font-medium">{item?.title}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">{item?.description}</p>
                                                            <p className="text-sm mt-2">
                                                                <span className="font-medium">Duration:</span> {item?.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-4"
                                                    onClick={() => {
                                                        setSelectedLesson(item);
                                                        setPreviewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewing(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Lesson Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedLesson?.title}</DialogTitle>
                        <DialogDescription>{selectedLesson?.description}</DialogDescription>
                    </DialogHeader>

                    {selectedLesson?.videoUrl && (() => {
                        const url = selectedLesson.videoUrl.trim();
                        const isMp4 = url.endsWith(".mp4");

                        return (
                            <div className="aspect-video w-full mt-4">
                                {isMp4 ? (
                                    <video
                                        controls
                                        controlsList="nodownload"
                                        className="w-full h-full rounded-lg"
                                        src={url}
                                    />
                                ) : (
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={getYouTubeEmbedUrl(url)}
                                        title="Lesson Preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                )}
                            </div>
                        );
                    })()}

                    <DialogFooter>
                        <div className="flex justify-between items-center w-full">
                            <span className="text-sm text-muted-foreground">
                                Duration: {selectedLesson?.duration}
                            </span>
                            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Courses;