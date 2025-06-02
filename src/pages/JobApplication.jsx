import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { getAllJobApplication } from '../services/job';
import { getTimeAgo } from '../helpers/TimeFormat';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

const JobApplicationCard = ({ job, isSelected, onView, onEdit, onDelete }) => {

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
                    onClick={() => onView?.(job)}
                />
                {/* <Edit
                    className="h-4 w-4 cursor-pointer text-blue-500"
                    onClick={() => onEdit?.(job)}
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-red-500"
                    onClick={() => onDelete?.(job._id)}
                /> */}
            </div>

            <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-md bg-white/80 shadow flex items-center justify-center overflow-hidden">
                    <img
                        src={job?.userId?.profile_pic || '/default-logo.png'}
                        alt="logo"
                        className="h-8 w-8 object-contain"
                    />
                </div>
                <div>
                    <h2 className={`text-md font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {job?.userId?.name}
                    </h2>
                    <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {job?.userId?.email}
                    </p>
                </div>
            </div>

            <p className="text-sm mt-1">Applied : {job?.jobId?.title}</p>

            <div className="flex gap-2 mt-3 flex-wrap justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${isSelected
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-blue-100 text-blue-700'
                            }`}
                    >
                        {job?.jobId?.jobType}
                    </span>
                    {job?.jobId?.remote && (
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
                    {getTimeAgo(job?.appliedAt)}
                </span>
            </div>
        </div>
    );
};

const JobApplication = () => {

    const { data: jobResponse = { data: [] }, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: getAllJobApplication,
    });

    const [selectedJob, setSelectedJob] = useState(null);
    const [openView, setOpenView] = useState(false);

    const handleView = (job) => {
        setSelectedJob(job);
        setOpenView(true);
    };

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Job Applications</h1>
            </div>
            <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobResponse?.data?.map((job, idx) => (
                    <JobApplicationCard key={idx} job={job} onView={handleView} />
                ))}
            </div>
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Job Application Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <p><strong>Applicant:</strong> {selectedJob?.userId?.name} ({selectedJob?.userId?.email})</p>
                        <p><strong>Job Title:</strong> {selectedJob?.jobId.title}</p>
                        <p><strong>Company:</strong> {selectedJob?.jobId.company}</p>
                        <p><strong>Location:</strong> {selectedJob?.jobId.location}</p>
                        <p><strong>Job Type:</strong> {selectedJob?.jobId.jobType}</p>
                        <p><strong>Salary:</strong> {selectedJob?.jobId.salary}</p>
                        <p><strong>Deadline:</strong> {new Date(selectedJob?.jobId.deadline).toLocaleDateString()}</p>
                        <p><strong>Applied At:</strong> {getTimeAgo(selectedJob?.appliedAt)}</p>
                        <p><strong>Resume:</strong> <a href={selectedJob?.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">View</a></p>
                        <p><strong>Cover Letter:</strong> {selectedJob?.coverLetter}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default JobApplication
