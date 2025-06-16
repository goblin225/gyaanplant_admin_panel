import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { createQuestion, getAllQuestions } from '../services/assessment';
import AssessmentForm from '../components/common/AssessmentForm';

const AssessmentManager = () => {

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const { data: assessmentResponse = { data: [] }, isLoading } = useQuery({
        queryKey: ['assessments'],
        queryFn: getAllQuestions,
    });

    const assessments = assessmentResponse.data;

    const handleViewAssessment = (assessment) => {
        setSelectedAssessment(assessment);
        setViewDialogOpen(true);
    };

    const handleDeleteAssessment = (id) => {
        console.log('Delete assessment:', id);
        // Add delete logic
    };

    const columns = [
        { header: 'Assessment Title', accessor: 'title' },
        { header: 'Total Marks', accessor: 'totalMarks' },
        {
            header: 'Pass %',
            accessor: 'passPercentage',
            cell: (row) => `${row.passPercentage || 0}%`
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
                            <Eye onClick={() => handleViewAssessment(row)} className="h-4 w-4 text-blue-600 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Trash onClick={() => handleDeleteAssessment(row._id)} className="h-4 w-4 text-red-600 cursor-pointer" />
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
                <Button className="bg-green-600 hover:bg-green-800" onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                </Button>
            </div>

            <DataTable
                data={assessments}
                columns={columns}
                searchable={true}
                searchField="title"
                isLoading={isLoading}
            />

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedAssessment?.title}</DialogTitle>
                        <DialogDescription>
                            Total Marks: {selectedAssessment?.totalMarks} | Pass %: {selectedAssessment?.passPercentage}%
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {selectedAssessment?.questions?.map((q, index) => (
                            <div key={index} className="border p-4 rounded-md shadow-sm">
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
                        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Assessment</DialogTitle>
                    </DialogHeader>

                    <AssessmentForm
                        onSubmit={async (formData) => {
                            console.log("📝 Form Submitted:", formData);
                            const responce = await createQuestion(formData)
                            if (responce?.status) {
                                queryClient.invalidateQueries({ queryKey: ['assessments'] });
                                toast({ title: 'Success', description: 'Question added successfully' });
                                setAddDialogOpen(false);
                            }
                        }}
                    />

                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AssessmentManager;
