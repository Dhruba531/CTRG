/**
 * Reviewer Management Component for SRC Chair.
 * View and manage reviewer profiles and workloads.
 */
import React, { useState, useEffect } from 'react';
import { Users, Mail, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reviewerApi, type Reviewer } from '../../services/api';

const ReviewerManagement: React.FC = () => {
    const [reviewers, setReviewers] = useState<Reviewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'available'>('all');

    useEffect(() => {
        loadReviewers();
    }, []);

    const loadReviewers = async () => {
        try {
            setLoading(true);
            const response = await reviewerApi.getWorkloads();
            setReviewers(response.data);
        } catch (err) {
            // Mock data for demo
            setReviewers([
                {
                    id: 1, user: 1, user_email: 'dr.smith@nsu.edu', user_name: 'Dr. John Smith',
                    area_of_expertise: 'Computer Science, AI, Machine Learning',
                    max_review_load: 5, is_active_reviewer: true, current_workload: 3, can_accept_more: true
                },
                {
                    id: 2, user: 2, user_email: 'dr.jones@nsu.edu', user_name: 'Dr. Sarah Jones',
                    area_of_expertise: 'Data Science, Statistics',
                    max_review_load: 4, is_active_reviewer: true, current_workload: 4, can_accept_more: false
                },
                {
                    id: 3, user: 3, user_email: 'dr.chen@nsu.edu', user_name: 'Dr. Wei Chen',
                    area_of_expertise: 'Biotechnology, Genetics',
                    max_review_load: 6, is_active_reviewer: true, current_workload: 2, can_accept_more: true
                },
                {
                    id: 4, user: 4, user_email: 'dr.patel@nsu.edu', user_name: 'Dr. Priya Patel',
                    area_of_expertise: 'Physics, Quantum Computing',
                    max_review_load: 3, is_active_reviewer: false, current_workload: 0, can_accept_more: false
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReviewers = reviewers.filter((r) => {
        if (filter === 'active') return r.is_active_reviewer;
        if (filter === 'available') return r.is_active_reviewer && r.can_accept_more;
        return true;
    });

    const getWorkloadColor = (current: number, max: number) => {
        const ratio = current / max;
        if (ratio >= 1) return 'text-red-600 bg-red-100';
        if (ratio >= 0.7) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getWorkloadBar = (current: number, max: number) => {
        const percentage = Math.min((current / max) * 100, 100);
        const color = percentage >= 100 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
        return (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reviewer Management</h1>
                    <p className="text-gray-500 mt-1">Manage reviewer profiles and track workloads</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Reviewers</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reviewers.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Reviewers</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {reviewers.filter(r => r.is_active_reviewer).length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Available</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                {reviewers.filter(r => r.can_accept_more).length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">At Capacity</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">
                                {reviewers.filter(r => r.is_active_reviewer && !r.can_accept_more).length}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <AlertCircle size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                {(['all', 'active', 'available'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({
                            f === 'all' ? reviewers.length :
                                f === 'active' ? reviewers.filter(r => r.is_active_reviewer).length :
                                    reviewers.filter(r => r.can_accept_more).length
                        })
                    </button>
                ))}
            </div>

            {/* Reviewers List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviewer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expertise
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Workload
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReviewers.map((reviewer) => (
                                <tr key={reviewer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {reviewer.user_name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{reviewer.user_name}</div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail size={12} className="mr-1" />
                                                    {reviewer.user_email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={reviewer.area_of_expertise}>
                                            {reviewer.area_of_expertise}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reviewer.is_active_reviewer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {reviewer.is_active_reviewer ? (
                                                <><CheckCircle size={12} className="mr-1" /> Active</>
                                            ) : (
                                                <><XCircle size={12} className="mr-1" /> Inactive</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={`font-medium ${getWorkloadColor(reviewer.current_workload, reviewer.max_review_load)}`}>
                                                    {reviewer.current_workload} / {reviewer.max_review_load}
                                                </span>
                                                {reviewer.can_accept_more ? (
                                                    <span className="text-green-600">Available</span>
                                                ) : (
                                                    <span className="text-red-600">Full</span>
                                                )}
                                            </div>
                                            {getWorkloadBar(reviewer.current_workload, reviewer.max_review_load)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedReviewer(reviewer)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reviewer Detail Modal */}
            {selectedReviewer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                        {selectedReviewer.user_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedReviewer.user_name}</h2>
                                        <p className="text-sm text-gray-500">{selectedReviewer.user_email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedReviewer(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Area of Expertise</h3>
                                <p className="mt-1 text-gray-900">{selectedReviewer.area_of_expertise}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedReviewer.is_active_reviewer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedReviewer.is_active_reviewer ? 'Active Reviewer' : 'Inactive'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                                    <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedReviewer.can_accept_more ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedReviewer.can_accept_more ? 'Can Accept Reviews' : 'At Capacity'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Workload</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        {getWorkloadBar(selectedReviewer.current_workload, selectedReviewer.max_review_load)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedReviewer.current_workload} / {selectedReviewer.max_review_load}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedReviewer(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewerManagement;
