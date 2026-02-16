/**
 * Stage 2 Review Form Component.
 * For reviewing revised proposals after Stage 1 tentative acceptance.
 * Reviews: concerns addressed, revised recommendation, and comments.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle, Send, Save, Download } from 'lucide-react';
import { assignmentApi, type ReviewAssignment } from '../../services/api';

interface Stage1Summary {
    originality_score: number;
    clarity_score: number;
    literature_review_score: number;
    methodology_score: number;
    impact_score: number;
    publication_potential_score: number;
    budget_appropriateness_score: number;
    timeline_practicality_score: number;
    total_score: number;
    narrative_comments: string;
}

const Stage2ReviewForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<ReviewAssignment | null>(null);
    const [stage1Summary, setStage1Summary] = useState<Stage1Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [concernsAddressed, setConcernsAddressed] = useState<'YES' | 'PARTIALLY' | 'NO' | ''>('');
    const [revisedRecommendation, setRevisedRecommendation] = useState<'ACCEPT' | 'REJECT' | ''>('');
    const [technicalComments, setTechnicalComments] = useState('');
    const [budgetComments, setBudgetComments] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await assignmentApi.getProposalDetails(Number(id));
            setAssignment(response.data);

            // Load Stage 1 summary if available
            if (response.data.stage1_summary) {
                setStage1Summary(response.data.stage1_summary);
            }

            // Load existing Stage 2 review if any
            if (response.data.stage2_review) {
                setConcernsAddressed(response.data.stage2_review.concerns_addressed as 'YES' | 'PARTIALLY' | 'NO' | '');
                setRevisedRecommendation(response.data.stage2_review.revised_recommendation as 'ACCEPT' | 'REJECT' | '');
                setTechnicalComments(response.data.stage2_review.technical_comments || '');
                setBudgetComments(response.data.stage2_review.budget_comments || '');
            }
        } catch (err) {
            console.error("Failed to load assignment", err);
            setError("Failed to load review assignment. Please try again.");
            setAssignment(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveDraft = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await assignmentApi.submitStage2Review(Number(id), {
                concerns_addressed: concernsAddressed,
                revised_recommendation: revisedRecommendation,
                technical_comments: technicalComments,
                budget_comments: budgetComments,
                is_draft: true,
            });
            alert('Draft saved successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save draft');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!concernsAddressed) {
            setError('Please indicate whether concerns were addressed');
            return;
        }
        if (!revisedRecommendation) {
            setError('Please provide your revised recommendation');
            return;
        }
        if (!technicalComments.trim()) {
            setError('Please provide technical comments');
            return;
        }

        if (!window.confirm('Are you sure you want to submit this Stage 2 review? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await assignmentApi.submitStage2Review(Number(id), {
                concerns_addressed: concernsAddressed,
                revised_recommendation: revisedRecommendation,
                technical_comments: technicalComments,
                budget_comments: budgetComments,
                is_draft: false,
            });
            alert('Stage 2 review submitted successfully!');
            navigate('/reviewer/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit review');
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/reviewer/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Stage 2 Review</h1>
                    <p className="text-gray-500">{assignment?.proposal_code} - {assignment?.proposal_title}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className="font-medium text-gray-900">
                        {assignment?.deadline && new Date(assignment.deadline).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {/* Stage 1 Summary */}
            {stage1Summary && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage 1 Review Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stage1Summary.total_score}</div>
                            <div className="text-sm text-gray-500">Total Score</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stage1Summary.total_score}%</div>
                            <div className="text-sm text-gray-500">Percentage</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stage1Summary.originality_score + stage1Summary.clarity_score + stage1Summary.literature_review_score}</div>
                            <div className="text-sm text-gray-500">Research (45)</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{stage1Summary.budget_appropriateness_score + stage1Summary.timeline_practicality_score}</div>
                            <div className="text-sm text-gray-500">Feasibility (15)</div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-medium text-yellow-800 mb-2">Previous Comments & Concerns</h3>
                        <p className="text-yellow-700 text-sm">{stage1Summary.narrative_comments}</p>
                    </div>
                </div>
            )}

            {/* Documents */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                    <FileText size={24} className="mr-3" />
                    <h2 className="text-lg font-semibold">Revised Documents</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <Download size={20} className="mr-2" />
                        Revised Proposal
                    </button>
                    <button className="flex items-center px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <Download size={20} className="mr-2" />
                        Response to Reviewers
                    </button>
                </div>
            </div>

            {/* Concerns Addressed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Were the Stage 1 concerns adequately addressed? <span className="text-red-500">*</span>
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { value: 'YES', label: 'Yes', desc: 'All concerns fully addressed', icon: CheckCircle, color: 'green' },
                        { value: 'PARTIALLY', label: 'Partially', desc: 'Some concerns remain', icon: AlertCircle, color: 'yellow' },
                        { value: 'NO', label: 'No', desc: 'Concerns not addressed', icon: XCircle, color: 'red' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setConcernsAddressed(option.value as any)}
                            className={`p-4 rounded-xl border-2 transition-all ${concernsAddressed === option.value
                                ? `border-${option.color}-500 bg-${option.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <option.icon
                                size={32}
                                className={`mx-auto mb-2 ${concernsAddressed === option.value ? `text-${option.color}-600` : 'text-gray-400'
                                    }`}
                            />
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Revised Recommendation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Revised Recommendation <span className="text-red-500">*</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setRevisedRecommendation('ACCEPT')}
                        className={`p-6 rounded-xl border-2 transition-all ${revisedRecommendation === 'ACCEPT'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <CheckCircle
                            size={40}
                            className={`mx-auto mb-3 ${revisedRecommendation === 'ACCEPT' ? 'text-green-600' : 'text-gray-400'
                                }`}
                        />
                        <div className="font-semibold text-lg text-gray-900">Recommend for Funding</div>
                        <div className="text-sm text-gray-500">The proposal is ready for funding consideration</div>
                    </button>
                    <button
                        onClick={() => setRevisedRecommendation('REJECT')}
                        className={`p-6 rounded-xl border-2 transition-all ${revisedRecommendation === 'REJECT'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <XCircle
                            size={40}
                            className={`mx-auto mb-3 ${revisedRecommendation === 'REJECT' ? 'text-red-600' : 'text-gray-400'
                                }`}
                        />
                        <div className="font-semibold text-lg text-gray-900">Do Not Recommend</div>
                        <div className="text-sm text-gray-500">The proposal does not meet funding criteria</div>
                    </button>
                </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Technical Comments <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Comment on how the PI addressed technical and methodological concerns.
                    </p>
                    <textarea
                        value={technicalComments}
                        onChange={(e) => setTechnicalComments(e.target.value)}
                        rows={4}
                        placeholder="Describe how technical concerns were addressed..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Budget Comments
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Comment on budget revisions and justifications (if applicable).
                    </p>
                    <textarea
                        value={budgetComments}
                        onChange={(e) => setBudgetComments(e.target.value)}
                        rows={3}
                        placeholder="Describe budget-related feedback..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/reviewer/dashboard')}
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
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Stage2ReviewForm;
