import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllCourses } from '../../services/course';

const AssessmentForm = ({ onSubmit }) => {

    const [form, setForm] = useState({
        course: '',
        title: '',
        maxAttempts: 0,
        totalMarks: 0,
        isPublished: true,
        questions: [],
    });

    const { data: courseData = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCourses,
    });

    const courseList = courseData?.data || [];


    const handleQuestionChange = (index, field, value) => {
        const updated = [...form.questions];
        updated[index][field] = value;
        setForm({ ...form, questions: updated });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const updated = [...form.questions];
        updated[qIndex].options[optIndex] = value;
        setForm({ ...form, questions: updated });
    };

    const handleAddQuestion = () => {
        setForm({
            ...form,
            questions: [
                ...form.questions,
                {
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    marks: 1,
                },
            ],
        });
    };

    const handleRemoveQuestion = (index) => {
        const updated = [...form.questions];
        updated.splice(index, 1);
        setForm({ ...form, questions: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.course || !form.title || form.questions.length === 0) {
            alert("Please fill required fields and add at least one question.");
            return;
        }
        onSubmit?.(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Course *</label>
                    <Select
                        value={form.course}
                        onValueChange={(value) => setForm({ ...form, course: value })}
                    >
                        <SelectTrigger className="w-full border rounded px-3 py-2">
                            <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courseList.map((course) => (
                                <SelectItem key={course._id} value={course._id}>
                                    {course?.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block font-medium">Assessment Title *</label>
                    <Input
                        className="w-full border rounded px-3 py-2"
                        value={form.title} placeholder='Assessment Title'
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block font-medium">Max Attempts</label>
                    <Input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={form.maxAttempts} placeholder='Max Attempts'
                        onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) || '' })}
                    />
                </div>
                <div>
                    <label className="block font-medium">Total Marks</label>
                    <Input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={form.totalMarks} placeholder='Total Marks'
                        onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) || '' })}
                    />
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                    <label className="text-sm font-medium">Publish Assessment</label>
                </div>
            </div>

            <hr className="my-4" />

            <div className="space-y-6">
                {form.questions.map((q, qIndex) => (
                    <div key={qIndex} className="border p-4 rounded-md space-y-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold">Question {qIndex + 1}</label>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveQuestion(qIndex)}
                            >
                                Remove
                            </Button>
                        </div>

                        <Input
                            placeholder="Enter question"
                            className="w-full border rounded px-3 py-2"
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map((opt, optIndex) => (
                                <Input
                                    key={optIndex}
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="w-full border rounded px-3 py-2"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                />
                            ))}
                        </div>

                        <Input
                            placeholder="Correct Answer"
                            className="w-full border rounded px-3 py-2"
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Marks"
                            className="w-full border rounded px-3 py-2"
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value) || '')}
                        />
                    </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddQuestion}>
                    + Add Question
                </Button>
            </div>

            <div className="text-right">
                <Button type="submit" className="bg-green-600">
                    Submit Assessment
                </Button>
            </div>
        </form>
    );
};

export default AssessmentForm;