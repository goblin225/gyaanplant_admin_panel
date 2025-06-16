import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
import { useForm, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { getAllCategory } from '../services/category';
import { getAllUsers } from '../services/user';
import { useAuth } from '../context/AuthProvider';
import { addTask, getAllTask, deleteTask, editTask } from '../services/task';
import Select from 'react-select';
import { getAllCourses } from '../services/course';
import { getAllQuestions } from '../services/assessment';
import { useFieldArray } from 'react-hook-form';

const Tasks = () => {

    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?._id;
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDataId, setSelectedDataId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [courseOptions, setCourseOptions] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [assessments, setAssessments] = useState([]);

    const { data: taskResponse, isLoading: isTasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: getAllTask,
    });

    const { data: categoryResponse, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getAllCategory,
    });

    const { data: userResponse, isLoading: isUsersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const { data: courseResponse, isLoading: isCoursesLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCourses,
    });

    const { data: assessmentResponse, isLoading: isAssessmentsLoading } = useQuery({
        queryKey: ['assessments'],
        queryFn: getAllQuestions,
    });

    const addTaskMutation = useMutation({
        mutationFn: addTask,
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            toast({
                title: 'Task Added',
                description: 'Task has been created successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create task',
                variant: 'destructive',
            });
        },
    });

    const editTaskMutation = useMutation({
        mutationFn: ({ id, data }) => editTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            toast({
                title: 'Task Updated',
                description: 'Task has been updated successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update task',
                variant: 'destructive',
            });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            toast({
                title: 'Task Deleted',
                description: 'Task has been deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete task',
                variant: 'destructive',
            });
        },
    });

    const form = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: '',
            deadlineHours: 48,
            points: 100,
            courseId: '',
            assignedTo: [],
            createdBy: userId,
            steps: [{
                title: '',
                type: 'video',
                points: 0,
                lessonId: '',
                assessmentId: ''
            }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'steps'
    });

    const watchSteps = useWatch({
        control: form.control,
        name: 'steps'
    });

    const selectedCourseId = useWatch({
        control: form.control,
        name: 'courseId'
    });

    const tasks = useMemo(() => taskResponse?.data || [], [taskResponse]);
    const categories = useMemo(() => categoryResponse?.data || [], [categoryResponse]);
    const users = useMemo(() => userResponse?.data || [], [userResponse]);
    const courses = useMemo(() => courseResponse?.data || [], [courseResponse]);
    const assessmentsData = useMemo(() => assessmentResponse?.data || [], [assessmentResponse]);

    useEffect(() => {
        if (courses.length) {
            setCourseOptions(courses);
        }
    }, [courses]);

    useEffect(() => {
        if (selectedCourseId) {
            const selectedCourse = courses.find(c => c._id === selectedCourseId);
            setLessons(selectedCourse?.lessons || []);
        }
    }, [selectedCourseId, courses]);

    useEffect(() => {
        if (assessmentsData.length) {
            setAssessments(assessmentsData);
        }
    }, [assessmentsData]);

    const handleView = (data) => {
        setSelectedData(data);
        setIsViewing(true);
    };

    const handleAddClick = () => {
        form.reset({
            title: '',
            description: '',
            category: '',
            deadlineHours: 0,
            points: 0,
            courseId: '',
            assignedTo: [],
            createdBy: userId,
            steps: [{
                title: '',
                type: 'video',
                points: 0,
                lessonId: '',
                assessmentId: ''
            }],
        });
        setIsEditing(false);
        setSelectedData(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (data) => {
        form.reset({
            title: data.title,
            description: data.description,
            category: data.category?._id || '',
            deadlineHours: data.deadlineHours,
            points: data.points,
            courseId: data.courseId?._id || '',
            assignedTo: data.assignedTo?.map(user => user._id) || [],
            steps: data.steps?.map(step => ({
                title: step.title,
                type: step.type,
                points: step.points,
                lessonId: step.lessonId?._id || '',
                assessmentId: step.assessmentId?._id || ''
            })) || []
        });
        setSelectedData(data);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (data) => {
        const taskData = {
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category,
            deadlineHours: data.deadlineHours,
            points: data.points,
            courseId: data.courseId,
            assignedTo: data.assignedTo,
            createdBy: userId,
            steps: data.steps.map(step => ({
                title: step.title,
                type: step.type,
                points: Number(step.points),
                lessonId: step.type === 'video' ? step.lessonId : undefined,
                assessmentId: step.type === 'quiz' ? step.assessmentId : undefined
            }))
        };

        if (isEditing && selectedData) {
            editTaskMutation.mutate({ id: selectedData._id, data: taskData });
        } else {
            addTaskMutation.mutate(taskData);
        }

        setIsDialogOpen(false);
    };

    const handleDeleteClick = (id) => {
        setSelectedDataId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDataId) return;
        deleteTaskMutation.mutate(selectedDataId);
        setDeleteDialogOpen(false);
        setSelectedDataId(null);
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        {
            header: 'Category',
            accessor: 'category',
            cell: (row) => (
                <span className="text-sm font-bold text-blue-700">
                    {row?.category?.title || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Deadline (hrs)',
            accessor: 'deadlineHours',
            cell: (row) => (
                <span className="text-sm">{row?.deadlineHours} hrs</span>
            ),
        },
        {
            header: 'Points',
            accessor: 'points',
            cell: (row) => {
                const earned = row?.progress?.[0]?.pointsEarned || 0;
                const total = row?.points || 0;
                const percentage = total > 0 ? Math.floor((earned / total) * 100) : 0;

                let barColor = 'bg-gray-300';
                if (percentage <= 20) barColor = 'bg-red-500';
                else if (percentage <= 70) barColor = 'bg-yellow-400';
                else barColor = 'bg-green-500';

                return (
                    <div className="text-sm">
                        <span>{earned}/{total} pts</span>
                        <div className="mt-1 h-2 w-full bg-gray-200 rounded">
                            <div
                                className={`h-full ${barColor} rounded transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Assigned To',
            accessor: 'assignedTo',
            cell: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row?.assignedTo?.map(user => (
                        <span
                            key={user?._id}
                            className="text-xs px-2 py-1 bg-blue-400 text-white rounded-md"
                        >
                            {user?.name}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'Created By',
            accessor: 'createdBy',
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
                    {row?.createdBy?.name}
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            cell: (row) => {
                const progressList = row?.progress || [];

                const statusMap = {
                    'Not-Started': 'bg-gray-100 text-gray-700',
                    'In-progress': 'bg-yellow-100 text-yellow-700',
                    'Completed': 'bg-green-100 text-green-700',
                    'Expired': 'bg-red-100 text-red-700'
                };

                const labelMap = {
                    'Not-Started': 'Not Started',
                    'In-progress': 'In Progress',
                    'Completed': 'Completed',
                    'Expired': 'Expired'
                };

                return (
                    <div className="flex flex-wrap gap-2">
                        {progressList.map((prog) => (
                            <span
                                key={prog._id}
                                className={`text-xs px-2 py-1 rounded-md font-medium ${statusMap[prog.status]}`}
                            >
                                {prog.userId?.name || 'Unknown'}: {labelMap[prog.status]}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="text-right flex items-center justify-center gap-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <Eye
                                onClick={() => handleView(row)}
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Task Management</h1>
                <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={tasks}
                    columns={columns}
                    searchable={true}
                    searchField="title"
                    isLoading={isTasksLoading}
                />
            </Card>

            {/* Add/Edit Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
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
                                                    placeholder="Title"
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
                                                    placeholder="Description"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="deadlineHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deadline Hours</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 48 hours"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="points"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Points *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min="0"
                                                    placeholder="100"
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
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                value={categories
                                                    .map(cat => ({ label: cat.title, value: cat._id }))
                                                    .find(option => option.value === field.value)}
                                                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                                options={categories.map(cat => ({
                                                    label: cat.title,
                                                    value: cat._id,
                                                }))}
                                                placeholder="Select Category"
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course *</FormLabel>
                                            <Select
                                                value={courses
                                                    .map(course => ({ label: course.title, value: course._id }))
                                                    .find(option => option.value === field.value)}
                                                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                                options={courses.map(course => ({
                                                    label: course.title,
                                                    value: course._id
                                                }))}
                                                placeholder="Select Course"
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="assignedTo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign Users</FormLabel>
                                            <Select
                                                isMulti
                                                options={users.map(user => ({
                                                    label: user.name,
                                                    value: user._id
                                                }))}
                                                value={users
                                                    .filter(user => field.value?.includes(user._id))
                                                    .map(user => ({ label: user.name, value: user._id }))
                                                }
                                                onChange={(selected) => {
                                                    const values = selected.map(item => item.value);
                                                    field.onChange(values);
                                                }}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="repeatType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repeat Mode *</FormLabel>
                                        <Select
                                            value={{ label: field.value, value: field.value }}
                                            onChange={(val) => field.onChange(val.value)}
                                            options={[
                                                { label: 'Single Day', value: 'Once' },
                                                { label: 'Daily', value: 'Daily' },
                                                { label: 'Custom Days (MWF)', value: 'Custom' },
                                                { label: 'Weekly', value: 'Weekly' },
                                                { label: 'Per Day Per User', value: 'PerDayPerUser' }
                                            ]}
                                            placeholder="Select Repeat Mode"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" required /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="endDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date *</FormLabel>
                                        <FormControl><Input {...field} type="date" required /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="repeatDays" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repeat Days (Custom Mode)</FormLabel>
                                        <Select
                                            isMulti
                                            value={(field.value || []).map(val => ({ label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][val], value: val }))}
                                            onChange={(selected) => field.onChange(selected.map(item => item.value))}
                                            options={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => ({ label, value: i }))}
                                            placeholder="Select Days"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Steps Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Task Steps</Label>

                                {fields.map((field, index) => (
                                    <Card key={field.id} className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base">Step {index + 1}</Label>
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`steps.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Step Title *</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Step title" required />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`steps.${index}.type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Step Type *</FormLabel>
                                                    <Select
                                                        value={{ label: field.value, value: field.value }}
                                                        onChange={(val) => field.onChange(val.value)}
                                                        options={[
                                                            { label: 'Video Lesson', value: 'video' },
                                                            { label: 'Quiz', value: 'quiz' }
                                                        ]}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {watchSteps?.[index]?.type === 'video' && (
                                            <FormField
                                                control={form.control}
                                                name={`steps.${index}.lessonId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Lesson *</FormLabel>
                                                        <Select
                                                            value={lessons
                                                                .map(lesson => ({ label: lesson.title, value: lesson._id }))
                                                                .find(option => option.value === field.value)}
                                                            onChange={(val) => field.onChange(val.value)}
                                                            options={lessons.map(lesson => ({
                                                                label: lesson.title,
                                                                value: lesson._id
                                                            }))}
                                                            placeholder="Select a lesson"
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {watchSteps?.[index]?.type === 'quiz' && (
                                            <FormField
                                                control={form.control}
                                                name={`steps.${index}.assessmentId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Quiz *</FormLabel>
                                                        <Select
                                                            value={assessments
                                                                .map(q => ({ label: q.title, value: q._id }))
                                                                .find(option => option.value === field.value)}
                                                            onChange={(val) => field.onChange(val.value)}
                                                            options={assessments.map(quiz => ({
                                                                label: quiz.title,
                                                                value: quiz._id
                                                            }))}
                                                            placeholder="Select a quiz"
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name={`steps.${index}.points`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Points *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min="0"
                                                            placeholder="Points for this step"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </Card>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({
                                        title: '',
                                        type: 'video',
                                        points: 0,
                                        lessonId: '',
                                        assessmentId: ''
                                    })}
                                    className="mt-2"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Step
                                </Button>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={form.formState.isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-800"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : (
                                        isEditing ? 'Update Task' : 'Add Task'
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
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-800"
                            onClick={confirmDelete}
                            disabled={deleteTaskMutation.isLoading}
                        >
                            {deleteTaskMutation.isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View task Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Task Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedData?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label>Title</Label>
                                    <p className="text-gray-700">{selectedData?.title}</p>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <p className="font-bold text-blue-600">
                                        {selectedData?.category?.title || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className="font-semibold">
                                        {selectedData?.status}
                                    </p>
                                </div>

                                <div className="col-span-3">
                                    <Label>Description</Label>
                                    <p className="text-gray-700 whitespace-pre-line">{selectedData?.description}</p>
                                </div>

                                <div>
                                    <Label>Deadline</Label>
                                    <p className="text-gray-700">{selectedData?.deadlineHours} hours</p>
                                </div>
                                <div>
                                    <Label>Points</Label>
                                    <p className="text-gray-700">{selectedData?.points}</p>
                                </div>
                                <div>
                                    <Label>Course</Label>
                                    <p className="text-gray-700">{selectedData?.course?.title || 'N/A'}</p>
                                </div>

                                <div>
                                    <Label>Start Time</Label>
                                    <p className="text-gray-700">
                                        {new Date(selectedData?.startTime).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label>Expiry Time</Label>
                                    <p className="text-gray-700">
                                        {new Date(selectedData?.expiryTime).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label>Created By</Label>
                                    <p className="text-blue-700 font-semibold">
                                        {selectedData?.createdBy?.name || 'N/A'}
                                    </p>
                                </div>

                                <div className="col-span-3">
                                    <Label>Assigned To</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedData?.assignedTo?.map(user => (
                                            <Badge key={user._id} className="text-xs text-orange-500 bg-transparent hover:bg-transparent">
                                                {user.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Steps Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Task Steps</Label>
                                <div className="space-y-3">
                                    {selectedData?.steps?.map((step, index) => (
                                        <Card key={step._id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">
                                                        {index + 1}. {step.title}
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            ({step.type}) - {step.points} pts
                                                        </span>
                                                    </p>
                                                    {step.type === 'video' && step.lessonId && (
                                                        <div className="mt-2 pl-4">
                                                            <p><span className="font-medium">Video:</span> {step.lessonData?.title}</p>
                                                            <p><span className="font-medium">Duration:</span> {step.lessonData?.duration}</p>
                                                            <p><span className="font-medium">Description:</span> {step.lessonData?.description}</p>
                                                        </div>
                                                    )}
                                                    {step.type === 'quiz' && step.assessmentId && (
                                                        <div className="mt-2 pl-4">
                                                            <p><span className="font-medium">Quiz:</span> {step.assessmentData?.title}</p>
                                                            {/* <p><span className="font-medium">Questions:</span> {step.assessmentId?.questions?.length}</p> */}
                                                            <p><span className="font-medium">Time Limit:</span> {step?.assessmentData?.timeLimit} mins</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">User Progress</Label>
                                <div className="space-y-3">
                                    {selectedData?.progress?.map(progress => (
                                        <Card key={progress._id} className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">
                                                        {progress.userId?.name || 'Unknown User'}
                                                    </p>
                                                    <div className="flex items-center mt-1">
                                                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${progress.status === 'Not-Started' ? 'bg-gray-100 text-gray-700' :
                                                            progress.status === 'In-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                                progress.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {progress.status}
                                                        </span>
                                                        <span className="ml-2 text-sm">
                                                            Points Earned: {progress.pointsEarned}/{selectedData.points}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Step Progress */}
                                            <div className="mt-3 space-y-2">
                                                {progress.stepLog?.map((stepLog, index) => (
                                                    <div key={index} className="flex items-center text-sm">
                                                        <span className="w-40 font-medium">{stepLog.stepTitle}</span>
                                                        <span className="w-20 text-gray-500">{stepLog.type}</span>
                                                        <span className={`ml-2 px-2 py-1 text-xs rounded ${stepLog.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {stepLog.completed ? 'Completed' : 'Pending'}
                                                        </span>
                                                        {stepLog.type === 'video' && (
                                                            <span className="ml-2 text-xs text-gray-500">
                                                                Watched: {stepLog.watchedDuration} / {stepLog.totalDuration}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
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
        </div>
    );
};

export default Tasks;