import { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getAllJobPosts, createJobPost, editJobPost } from '../services/job';
import { getTimeAgo } from '../helpers/TimeFormat';
import { useAuth } from '../context/AuthProvider';

const JobCard = ({ job, isSelected, onEdit, onDelete }) => {

    return (
        <div
            className={`relative rounded-xl shadow-sm transition-all duration-200 p-4 flex flex-col justify-between border ${isSelected
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-800 hover:shadow-md'
                }`}
        >
            <div className="absolute top-2 right-2 flex gap-2 mt-3">
                <Eye
                    className="h-4 w-4 cursor-pointer text-gray-500"
                    onClick={() => setOpenView(true)}
                />
                <Edit
                    className="h-4 w-4 cursor-pointer text-blue-500"
                    onClick={() => onEdit?.(job)}
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-red-500"
                    onClick={() => onDelete?.(job._id)}
                />
            </div>

            <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-md bg-white/80 shadow flex items-center justify-center overflow-hidden">
                    <img
                        src={job?.createdBy?.profile_pic || '/default-logo.png'}
                        alt="logo"
                        className="h-8 w-8 object-contain"
                    />
                </div>
                <div>
                    <h2 className={`text-md font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {job.title}
                    </h2>
                    <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {job.company}
                    </p>
                </div>
            </div>

            <p className="text-sm mt-1">{job?.description}</p>
            <p className="text-sm mt-1">Location: {job.location}</p>

            <div className="flex gap-2 mt-3 flex-wrap justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${isSelected
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-blue-100 text-blue-700'
                            }`}
                    >
                        {job?.jobType}
                    </span>
                    {job?.remote && (
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${isSelected
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-purple-100 text-purple-700'
                                }`}
                        >
                            Remote
                        </span>
                    )}
                </div>
                <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                    {getTimeAgo(job?.publishedAt)}
                </span>
            </div>
        </div>
    );
};

const JobPage = () => {

    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?._id;
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const { data: jobResponse = { data: [] }, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: getAllJobPosts,
    });

    const form = useForm({
        defaultValues: {
            title: '',
            company: '',
            location: '',
            salary: '',
            deadline: '',

            jobType: '',
            remote: false,

            description: '',
            requirements: [],
            isPublished: false,
        },
    });

    const handleAddJob = async (data) => {
        setLoading(true);
        try {
            const payload = {
                title: data.title,
                company: data.company,
                location: data.location,
                salary: data.salary,
                deadline: data.deadline,
                jobType: data.jobType,
                remote: data.remote,
                description: data.description,
                requirements: data.requirements,
                isPublished: data.isPublished,
                createdBy: userId
            };

            const response = editing
                ? await editJobPost(editing._id, payload)
                : await createJobPost(payload);
            if (response?.statusCode === 200) {
                toast({
                    title: editing ? 'Job Post Updated' : 'Job Post Added',
                    description: `${data?.title} ${editing ? 'updated' : 'added'} successfully.`,
                });
                setIsAdding(false);
                setEditing(null);
                form.reset();
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast({
                title: 'Error',
                description: 'Failed to save user. Try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Jobs</h1>
                <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-800">Add Job</Button>
            </div>
            <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobResponse?.data?.map((job, idx) => (
                    <JobCard key={idx} job={job} />
                ))}
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Job Post' : 'Add Job Post'}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddJob)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'title', label: 'Job Title' },
                                    { name: 'company', label: 'Company Name' },
                                    { name: 'location', label: 'Job Location' },
                                    { name: 'salary', label: 'Salary (e.g., ₹60,000/month)' },
                                    { name: 'deadline', label: 'Application Deadline', type: 'date' },
                                ].map(({ name, label, type }) => (
                                    <FormField
                                        key={name}
                                        control={form.control}
                                        name={name}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{label}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type={type || 'text'} placeholder={label} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name="jobType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select job type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Full time">Full time</SelectItem>
                                                    <SelectItem value="Part time">Part time</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="remote"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 mt-2">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </FormControl>
                                            <FormLabel className="mb-0">Remote</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Describe the job role..." rows={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requirements</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="List key requirements separated by commas"
                                                rows={3}
                                                onBlur={(e) => {
                                                    // Convert comma string to array
                                                    field.onChange(e.target.value.split(',').map((s) => s.trim()));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <FormField
                                        control={form.control}
                                        name="isPublished"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                    />
                                                </FormControl>
                                                <FormLabel className="mb-0">Publish Now</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditing(null);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-800 flex items-center gap-2"
                                >
                                    {loading && (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            ></path>
                                        </svg>
                                    )}
                                    {editing ? 'Update Job' : 'Add Job'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobPage;