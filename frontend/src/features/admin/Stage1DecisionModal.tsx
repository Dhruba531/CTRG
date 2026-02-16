/**
 * Stage 1 Decision Modal Component.
 * Allows SRC Chair to make Stage 1 decisions on proposals.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { proposalApi, type Proposal, type ReviewAssignment } from '../../services/api';

interface Props {
    proposal: Proposal;
    onClose: () => void;
    onSuccess: () => void;
}

const Stage1DecisionModal: React.FC<Props> = ({ proposal, onClose, onSuccess }) => {
    const [decision, setDecision] = useState<'ACCEPT' | 'REJECT' | 'TENTATIVELY_ACCEPT' | ''>('');
    const [chairComments, setChairComments] = useState('');
    const [reviews, setReviews] = useState<ReviewAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await proposalApi.getReviews(proposal.id);
            setReviews(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to load reviews", err);
            setError("Failed to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [proposal.id]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!decision) {
            setError('Please select a decision');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await proposalApi.stage1Decision(proposal.id, decision, chairComments);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit decision');
        } finally {
            setSubmitting(false);
        }
    };

    const averageScore = reviews.length > 0
        ? Math.round(reviews.reduce((sum, r) => sum + (r.stage1_score?.percentage_score || 0), 0) / reviews.length)
        : 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden m-4">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex justify-between items-start">
                        <div className="text-white">
                            <h2 className="text-xl font-semibold">Stage 1 Decision</h2>
                            <p className="text-purple-100 text-sm mt-1">{proposal.proposal_code} - {proposal.title}</p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                            <AlertCircle size={18} className="mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Score Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Review Summary</h3>
                            <div className="text-center">
                                <span className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</span>
                                <span className="text-sm text-gray-500 block">Average Score</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.filter(r => r.stage === 1 && r.stage1_score).map((review, idx) => (
                                    <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">Reviewer {idx + 1}</span>
                                                <span className="text-sm text-gray-500 ml-2">({review.reviewer_name})</span>
                                            </div>
                                            <span className={`text-lg font-bold ${getScoreColor(review.stage1_score?.percentage_score || 0)}`}>
                                                {review.stage1_score?.percentage_score}%
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium">{review.stage1_score?.originality_score}/15</div>
                                                <div className="text-gray-500">Originality</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium">{review.stage1_score?.methodology_score}/15</div>
                                                <div className="text-gray-500">Methodology</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium">{review.stage1_score?.impact_score}/15</div>
                                                <div className="text-gray-500">Impact</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium">{review.stage1_score?.budget_appropriateness_score}/10</div>
                                                <div className="text-gray-500">Budget</div>
                                            </div>
                                        </div>

                                        {review.stage1_score?.narrative_comments && (
                                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                <FileText size={14} className="inline mr-1" />
                                                {review.stage1_score.narrative_comments}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Decision Selection */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Decision</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDecision('ACCEPT')}
                                    className={`p-4 border-2 rounded-xl text-center transition-all ${decision === 'ACCEPT'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <CheckCircle size={24} className={`mx-auto mb-2 ${decision === 'ACCEPT' ? 'text-green-600' : 'text-gray-400'}`} />
                                    <div className="font-medium text-gray-900">Accept</div>
                                    <div className="text-xs text-gray-500">No corrections needed</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDecision('TENTATIVELY_ACCEPT')}
                                    className={`p-4 border-2 rounded-xl text-center transition-all ${decision === 'TENTATIVELY_ACCEPT'
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-gray-200 hover:border-yellow-300'
                                        }`}
                                >
                                    <AlertTriangle size={24} className={`mx-auto mb-2 ${decision === 'TENTATIVELY_ACCEPT' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                    <div className="font-medium text-gray-900">Tentative Accept</div>
                                    <div className="text-xs text-gray-500">Requires revision</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDecision('REJECT')}
                                    className={`p-4 border-2 rounded-xl text-center transition-all ${decision === 'REJECT'
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <XCircle size={24} className={`mx-auto mb-2 ${decision === 'REJECT' ? 'text-red-600' : 'text-gray-400'}`} />
                                    <div className="font-medium text-gray-900">Reject</div>
                                    <div className="text-xs text-gray-500">Does not meet criteria</div>
                                </button>
                            </div>
                        </div>

                        {/* Chair Comments */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chair Comments {decision === 'TENTATIVELY_ACCEPT' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={chairComments}
                                onChange={(e) => setChairComments(e.target.value)}
                                rows={4}
                                required={decision === 'TENTATIVELY_ACCEPT'}
                                placeholder="Add comments for the PI (required for tentative acceptance)..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !decision}
                        className={`px-4 py-2 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${decision === 'ACCEPT' ? 'bg-green-600 hover:bg-green-700' :
                            decision === 'TENTATIVELY_ACCEPT' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                decision === 'REJECT' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-gray-400'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Decision'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Stage1DecisionModal;
