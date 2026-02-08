/**
 * Enhanced Proposal Form Component.
 * For creating new proposals or editing drafts.
 * Includes grant cycle selection, file upload with 50MB limit, and draft saving.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, ArrowLeft, Upload, FileText, AlertCircle, X } from 'lucide-react';
import { proposalApi, cycleApi, type GrantCycle } from '../../services/api';

interface ProposalFormData {
    title: string;
    abstract: string;
    fund_requested: number;
    cycle: number | '';
    file: File | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ProposalForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cycles, setCycles] = useState<GrantCycle[]>([]);

    const [formData, setFormData] = useState<ProposalFormData>({
        title: '',
        abstract: '',
        fund_requested: 0,
        cycle: '',
        file: null,
    });
    const [existingFile, setExistingFile] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load grant cycles
            try {
                const cycleRes = await cycleApi.getAll();
                setCycles(cycleRes.data.filter(c => c.is_active));
            } catch {
                setCycles([
                    {
                        id: 1, name: 'Spring 2025', year: 2025, submission_start: '2025-01-01', submission_end: '2025-03-31',
                        review_deadline_stage1: '2025-04-30', revision_deadline_days: 14, review_deadline_stage2: '2025-06-15',
                        stage1_threshold: 60, final_decision_date: '2025-06-30', is_active: true
                    },
                ]);
            }

            // Load existing proposal if editing
            if (id) {
                try {
                    const propRes = await proposalApi.getById(Number(id));
                    setFormData({
                        title: propRes.data.title,
                        abstract: propRes.data.abstract,
                        fund_requested: propRes.data.fund_requested,
                        cycle: propRes.data.cycle,
                        file: null,
                    });
                    setExistingFile(propRes.data.proposal_file || null);
                } catch {
                    // Mock for demo
                    setFormData({
                        title: 'Quantum Computing Applications',
                        abstract: 'This research explores quantum computing applications in cryptography and optimization.',
                        fund_requested: 60000,
                        cycle: 1,
                        file: null,
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'fund_requested' || name === 'cycle' ? (value ? Number(value) : '') : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setError('File size exceeds 50MB limit');
                return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                setError('Only PDF and Word documents are allowed');
                return;
            }
            setFormData(prev => ({ ...prev, file }));
            setError(null);
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, file: null }));
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Title is required');
            return false;
        }
        if (!formData.abstract.trim()) {
            setError('Abstract is required');
            return false;
        }
        if (!formData.cycle) {
            setError('Please select a grant cycle');
            return false;
        }
        if (formData.fund_requested <= 0) {
            setError('Please enter a valid funding amount');
            return false;
        }
        if (!isEditing && !formData.file && !existingFile) {
            setError('Please upload a proposal document');
            return false;
        }
        return true;
    };

    const handleSaveDraft = async () => {
        try {
            setSubmitting(true);
            setError(null);

            const data = new FormData();
            data.append('title', formData.title);
            data.append('abstract', formData.abstract);
            data.append('fund_requested', String(formData.fund_requested));
            data.append('cycle', String(formData.cycle));
            data.append('status', 'DRAFT');
            if (formData.file) {
                data.append('proposal_file', formData.file);
            }

            if (isEditing) {
                await proposalApi.update(Number(id), data);
            } else {
                await proposalApi.create(data);
            }

            alert('Draft saved successfully!');
            navigate('/pi/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save draft');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!window.confirm('Are you sure you want to submit this proposal? You will not be able to edit it after submission.')) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const data = new FormData();
            data.append('title', formData.title);
            data.append('abstract', formData.abstract);
            data.append('fund_requested', String(formData.fund_requested));
            data.append('cycle', String(formData.cycle));
            data.append('status', 'SUBMITTED');
            if (formData.file) {
                data.append('proposal_file', formData.file);
            }

            if (isEditing) {
                await proposalApi.update(Number(id), data);
            } else {
                await proposalApi.create(data);
            }

            alert('Proposal submitted successfully!');
            navigate('/pi/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit proposal');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/pi/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Proposal' : 'New Proposal'}
                </h1>
                <p className="text-gray-500">
                    {isEditing ? 'Continue working on your draft proposal' : 'Submit a new research grant proposal'}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Grant Cycle */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Grant Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="cycle"
                        value={formData.cycle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a grant cycle</option>
                        {cycles.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>
                                {cycle.name} ({cycle.year}){cycle.submission_end ? ` - Deadline: ${new Date(cycle.submission_end).toLocaleDateString()}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Proposal Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter a descriptive title for your research proposal"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Abstract */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Abstract <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                        Provide a brief summary of your research proposal (300-500 words recommended)
                    </p>
                    <textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Describe the objectives, methodology, and expected outcomes of your research..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Funding Amount */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Requested Funding (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            name="fund_requested"
                            value={formData.fund_requested || ''}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1000"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Proposal Document <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Upload your full proposal document (PDF or Word, max 50MB)
                    </p>

                    {existingFile && !formData.file && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText size={20} className="text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">Current file: {existingFile}</span>
                            </div>
                        </div>
                    )}

                    {formData.file ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText size={24} className="text-blue-600 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">{formData.file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button onClick={removeFile} className="text-gray-400 hover:text-red-600">
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                                <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-500">PDF or Word document (max 50MB)</p>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/pi/dashboard')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={submitting}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <Save size={18} className="mr-2" />
                        Save Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Send size={18} className="mr-2" />
                        Submit Proposal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProposalForm;
