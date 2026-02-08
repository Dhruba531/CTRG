/**
 * Enhanced Reviewer Dashboard Component.
 * Shows assigned proposals, pending reviews, and completed reviews.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock, CheckCircle, FileText, AlertCircle, Calendar,
    ChevronRight, Eye, Edit3
} from 'lucide-react';
import { assignmentApi, type ReviewAssignment } from '../../services/api';

interface ReviewerStats {
    total_assignments: number;
    pending: number;
    completed: number;
    overdue: number;
}

const ReviewerDashboard: React.FC = () => {
    const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
    const [stats, setStats] = useState<ReviewerStats>({ total_assignments: 0, pending: 0, completed: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await assignmentApi.getAll();
            setAssignments(response.data);

            // Calculate stats
            const pending = response.data.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length;
            const completed = response.data.filter(a => a.status === 'COMPLETED').length;
            const overdue = response.data.filter(a =>
                (a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS') &&
                new Date(a.deadline) < new Date()
            ).length;

            setStats({
                total_assignments: response.data.length,
                pending,
                completed,
                overdue
            });
        } catch {
            // Mock data for demo
            const mockData: ReviewAssignment[] = [
                {
                    id: 1, proposal: 1, proposal_title: 'AI for Climate Change Prediction', proposal_code: 'CTRG-2025-001',
                    reviewer: 1, reviewer_name: 'Dr. John Smith', reviewer_email: 'smith@nsu.edu',
                    stage: 1, stage_display: 'Stage 1', status: 'ASSIGNED', status_display: 'Assigned',
                    deadline: '2025-02-28'
                },
                {
                    id: 2, proposal: 2, proposal_title: 'Blockchain in Healthcare Records', proposal_code: 'CTRG-2025-002',
                    reviewer: 1, reviewer_name: 'Dr. John Smith', reviewer_email: 'smith@nsu.edu',
                    stage: 1, stage_display: 'Stage 1', status: 'IN_PROGRESS', status_display: 'In Progress',
                    deadline: '2025-02-20'
                },
                {
                    id: 3, proposal: 3, proposal_title: 'Quantum Computing Applications', proposal_code: 'CTRG-2025-003',
                    reviewer: 1, reviewer_name: 'Dr. John Smith', reviewer_email: 'smith@nsu.edu',
                    stage: 2, stage_display: 'Stage 2', status: 'ASSIGNED', status_display: 'Assigned',
                    deadline: '2025-03-15'
                },
                {
                    id: 4, proposal: 4, proposal_title: 'Renewable Energy Grid Optimization', proposal_code: 'CTRG-2025-004',
                    reviewer: 1, reviewer_name: 'Dr. John Smith', reviewer_email: 'smith@nsu.edu',
                    stage: 1, stage_display: 'Stage 1', status: 'COMPLETED', status_display: 'Completed',
                    deadline: '2025-02-15',
                    stage1_score: {
                        id: 1, originality_score: 12, clarity_score: 13, literature_review_score: 11,
                        methodology_score: 14, impact_score: 12, publication_potential_score: 8,
                        budget_appropriateness_score: 9, timeline_practicality_score: 4,
                        narrative_comments: 'Good proposal with strong methodology.', total_score: 83, percentage_score: 83
                    }
                },
            ];
            setAssignments(mockData);
            setStats({
                total_assignments: 4,
                pending: 3,
                completed: 1,
                overdue: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(a => {
        if (filter === 'pending') return a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS';
        if (filter === 'completed') return a.status === 'COMPLETED';
        return true;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ASSIGNED: 'bg-yellow-100 text-yellow-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const isOverdue = (deadline: string, status: string) => {
        return (status === 'ASSIGNED' || status === 'IN_PROGRESS') && new Date(deadline) < new Date();
    };

    const getDaysRemaining = (deadline: string) => {
        const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage your review assignments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_assignments}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                {(['all', 'pending', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({
                            f === 'all' ? assignments.length :
                                f === 'pending' ? stats.pending : stats.completed
                        })
                    </button>
                ))}
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredAssignments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No assignments found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-mono text-gray-500">{assignment.proposal_code}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assignment.status)}`}>
                                                {assignment.status_display}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {assignment.stage_display}
                                            </span>
                                            {isOverdue(assignment.deadline, assignment.status) && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mt-1">{assignment.proposal_title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Calendar size={14} className="mr-1" />
                                            <span>
                                                Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                                {!isOverdue(assignment.deadline, assignment.status) && assignment.status !== 'COMPLETED' && (
                                                    <span className={`ml-2 ${getDaysRemaining(assignment.deadline) <= 3 ? 'text-red-600 font-medium' : ''}`}>
                                                        ({getDaysRemaining(assignment.deadline)} days left)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {assignment.status === 'COMPLETED' ? (
                                            <Link
                                                to={`/reviewer/reviews/${assignment.id}/view`}
                                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Eye size={16} className="mr-2" />
                                                View
                                            </Link>
                                        ) : (
                                            <Link
                                                to={`/reviewer/reviews/${assignment.id}`}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Edit3 size={16} className="mr-2" />
                                                {assignment.status === 'IN_PROGRESS' ? 'Continue' : 'Start Review'}
                                            </Link>
                                        )}
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewerDashboard;
