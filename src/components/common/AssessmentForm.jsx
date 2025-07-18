import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getAllCourses } from '../../services/course';

const AssessmentForm = ({ onSubmit }) => {
    const [form, setForm] = useState({
        course: '',
        title: '',
        maxAttempts: '',
        passPercentage: '',
        timeLimit: '',
        isPublished: true,
        questions: []
    });

    const { data: courseData = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCourses
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

    const handleTestCaseChange = (qIndex, tcIndex, field, value) => {
        const updated = [...form.questions];
        updated[qIndex].testCases[tcIndex][field] = value;
        setForm({ ...form, questions: updated });
    };

    const handleAddQuestion = () => {
        setForm({
            ...form,
            questions: [
                ...form.questions,
                {
                    type: 'mcq',
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    marks: 1,
                    codeTemplate: '',
                    expectedOutput: '',
                    language: '',
                    testCases: [{ input: '', output: '' }]
                }
            ]
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
                    <Select value={form.course} onValueChange={(val) => setForm({ ...form, course: val })}>
                        <SelectTrigger className="w-full border rounded px-3 py-2">
                            <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courseList.map(course => (
                                <SelectItem key={course._id} value={course._id}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block font-medium">Title *</label>
                    <Input value={form.title} placeholder='Title' onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                    <label className="block font-medium">Max Attempts</label>
                    <Input
                        type="number" placeholder='Max Attempts'
                        value={form.maxAttempts || ''}
                        onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block font-medium">Time Limit (mins)</label>
                    <Input
                        type="number" placeholder='Time Limit (mins)'
                        value={form.timeLimit || ''}
                        onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block font-medium">Pass Percentage (%)</label>
                    <Input
                        type="number" placeholder='Pass Percentage (%)'
                        value={form.passPercentage || ''}
                        onChange={(e) => setForm({ ...form, passPercentage: Number(e.target.value) })}
                    />
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                    <label className="text-sm font-medium">Publish</label>
                </div>
            </div>

            <hr />

            <div className="space-y-6">
                {form.questions.map((q, qIndex) => (
                    <div key={qIndex} className="border p-4 rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold">Question {qIndex + 1}</label>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveQuestion(qIndex)}>
                                Remove
                            </Button>
                        </div>

                        <Select
                            value={q.type}
                            onValueChange={(val) => handleQuestionChange(qIndex, 'type', val)}
                        >
                            <SelectTrigger className="w-full border rounded mb-2">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mcq">MCQ</SelectItem>
                                <SelectItem value="code">Code</SelectItem>
                            </SelectContent>
                        </Select>

                        <label className="block font-medium mt-3">Question</label>
                        <Input placeholder="Question" value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} />

                        {q.type === 'mcq' && (
                            <>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {q.options.map((opt, i) => (
                                        <Input
                                            key={i}
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                                        />
                                    ))}
                                </div>
                                <label className="block font-medium mt-3">Correct Answer</label>
                                <Input className='mt-2'
                                    placeholder="Correct Answer"
                                    value={q.correctAnswer}
                                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                />
                            </>
                        )}

                        {q.type === 'code' && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block font-medium mb-1">Code Template</label>
                                    <Input
                                        placeholder="Code Template"
                                        value={q.codeTemplate}
                                        onChange={(e) => handleQuestionChange(qIndex, 'codeTemplate', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1">Expected Output</label>
                                    <Input
                                        placeholder="Expected Output"
                                        value={q.expectedOutput}
                                        onChange={(e) => handleQuestionChange(qIndex, 'expectedOutput', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1">Language</label>
                                    <Input
                                        placeholder="e.g. javascript, python, java"
                                        value={q.language}
                                        onChange={(e) => handleQuestionChange(qIndex, 'language', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1">Test Cases</label>
                                    <div className="space-y-3">
                                        {q.testCases.map((tc, i) => (
                                            <div key={i} className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium">Input</label>
                                                    <Input
                                                        placeholder="Input"
                                                        value={tc.input}
                                                        onChange={(e) => handleTestCaseChange(qIndex, i, 'input', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Expected Output</label>
                                                    <Input
                                                        placeholder="Expected Output"
                                                        value={tc.output}
                                                        onChange={(e) => handleTestCaseChange(qIndex, i, 'output', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <label className="mt-4 block font-medium">Marks</label>
                        <Input
                            placeholder="Marks"
                            type="number"
                            className="mt-2"
                            value={q.marks || ''}
                            onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value))}
                        />
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={handleAddQuestion}>
                + Add Question
            </Button>

            <div className="text-right mt-4">
                <Button type="submit" className="bg-green-600">
                    Submit
                </Button>
            </div>
        </form>
    );
};

export default AssessmentForm;
