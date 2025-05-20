import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {  getAllQuestions } from '../services/assessment';

const AssessmentManager = () => {
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [viewAssessmentOpen, setViewAssessmentOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: assessmentResponse = { data: [] }, isLoading: isLoadingAssessments } = useQuery({
        queryKey: ['assessments'],
        queryFn: getAllQuestions,
    });

    const assessments = assessmentResponse.data;

    const handleViewAssessment = (assessment) => {
        setSelectedAssessment(assessment);
        setViewAssessmentOpen(true);
    };

    const handleDeleteAssessment = (id) => {
        // add delete logic here
        console.log('Delete assessment:', id);
    };

    const columns = [
        {
            header: 'Assessment Title',
            accessor: 'title',
        },
        {
            header: 'Total Marks',
            accessor: 'totalMarks',
        },
        {
            header: 'Pass %',
            accessor: 'passPercentage',
            cell: (row) => `${row?.passPercentage || 0}%`
        },
        {
            header: 'Questions',
            accessor: 'questions',
            cell: (row) => `${row.questions.length}`
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="flex gap-2 justify-center">
                    <Tooltip>
                        <TooltipTrigger>
                            <Eye
                                onClick={() => handleViewAssessment(row)}
                                className="h-4 w-4 text-blue-600 cursor-pointer"
                            />
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Trash
                                onClick={() => handleDeleteAssessment(row._id)}
                                className="h-4 w-4 text-red-600 cursor-pointer"
                            />
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Assessment Management</h1>
                <Button className="bg-green-600 hover:bg-green-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                </Button>
            </div>

            <DataTable
                data={assessments}
                columns={columns}
                searchable={true}
                searchField="title"
                isLoading={isLoadingAssessments}
            />

            <Dialog open={viewAssessmentOpen} onOpenChange={setViewAssessmentOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedAssessment?.title}</DialogTitle>
                        <DialogDescription>
                            Total Marks: {selectedAssessment?.totalMarks} | Pass %: {selectedAssessment?.passPercentage}%
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {selectedAssessment?.questions?.map((q, index) => (
                            <div key={q._id} className="border p-4 rounded-md shadow-sm">
                                <h4 className="font-semibold">{index + 1}. {q.question}</h4>
                                <ul className="list-disc list-inside mt-1">
                                    {q.options.map((opt, i) => (
                                        <li key={i} className={opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-gray-500 mt-2">Marks: {q.marks}</p>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setViewAssessmentOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AssessmentManager;
