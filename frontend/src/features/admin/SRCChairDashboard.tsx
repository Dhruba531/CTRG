/**
 * Enhanced SRC Chair Dashboard Component.
 * Main dashboard with statistics, quick actions, and recent activity.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Users, Clock, AlertTriangle,
    Calendar, Download, ChevronRight, RefreshCw,
    BarChart3
} from 'lucide-react';
import { dashboardApi, proposalApi, type Proposal } from '../../services/api';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { CycleProgress } from '../../components/dashboard/CycleProgress';
import { StatusChart } from '../../components/dashboard/StatusChart';
import { mockActivities } from '../../data/mockData';

interface DashboardStats {
    total_proposals: number;
    pending_reviews: number;
    awaiting_decision: number;
    awaiting_revision: number;
    status_breakdown: Record<string, number>;
}

const SRCChairDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, proposalsRes] = await Promise.all([
                dashboardApi.getSrcChairStats(),
                proposalApi.getAll(),
            ]);
            setStats(statsRes.data);
            setRecentProposals(proposalsRes.data.slice(0, 5));
        } catch (err) {
            // Mock data
            setStats({
                total_proposals: 24,
                pending_reviews: 8,
                awaiting_decision: 5,
                awaiting_revision: 3,
                status_breakdown: {
                    SUBMITTED: 4,
                    UNDER_STAGE_1_REVIEW: 8,
                    TENTATIVELY_ACCEPTED: 3,
                    REVISION_REQUESTED: 3,
                    UNDER_STAGE_2_REVIEW: 2,
                    FINAL_ACCEPTED: 3,
                    FINAL_REJECTED: 1,
                }
            });
            setRecentProposals([
                { id: 1, proposal_code: 'CTRG-2025-001', title: 'AI for Climate Change Prediction', pi: 1, pi_name: 'Dr. John Smith', pi_department: 'Computer Science', pi_email: '', fund_requested: 50000, cycle: 1, cycle_name: 'Spring 2025', status: 'UNDER_STAGE_1_REVIEW', status_display: 'Under Stage 1 Review', created_at: '2025-02-01', abstract: '' },
                { id: 2, proposal_code: 'CTRG-2025-002', title: 'Blockchain in Healthcare Records', pi: 2, pi_name: 'Dr. Sarah Jones', pi_department: 'Information Systems', pi_email: '', fund_requested: 45000, cycle: 1, cycle_name: 'Spring 2025', status: 'REVISION_REQUESTED', status_display: 'Revision Requested', created_at: '2025-01-28', revision_deadline: '2025-02-15', abstract: '' },
                { id: 3, proposal_code: 'CTRG-2025-003', title: 'Quantum Computing Applications', pi: 3, pi_name: 'Dr. Wei Chen', pi_department: 'Physics', pi_email: '', fund_requested: 75000, cycle: 1, cycle_name: 'Spring 2025', status: 'SUBMITTED', status_display: 'Submitted', created_at: '2025-01-25', abstract: '' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

    const statusCards = [
        { label: 'Total Proposals', value: stats?.total_proposals || 0, icon: FileText, color: 'blue', bgColor: 'bg-blue-500' },
        { label: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: Clock, color: 'yellow', bgColor: 'bg-yellow-500' },
        { label: 'Awaiting Decision', value: stats?.awaiting_decision || 0, icon: AlertTriangle, color: 'purple', bgColor: 'bg-purple-500' },
        { label: 'Awaiting Revision', value: stats?.awaiting_revision || 0, icon: RefreshCw, color: 'orange', bgColor: 'bg-orange-500' },
    ];

    const quickActions = [
        { label: 'Manage Grant Cycles', icon: Calendar, path: '/admin/cycles', color: 'bg-indigo-600' },
        { label: 'Manage Reviewers', icon: Users, path: '/admin/reviewers', color: 'bg-teal-600' },
        { label: 'View All Proposals', icon: FileText, path: '/admin/proposals', color: 'bg-blue-600' },
        { label: 'Generate Reports', icon: Download, path: '/admin/reports', color: 'bg-purple-600' },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            SUBMITTED: 'bg-blue-100 text-blue-800',
            UNDER_STAGE_1_REVIEW: 'bg-indigo-100 text-indigo-800',
            TENTATIVELY_ACCEPTED: 'bg-yellow-100 text-yellow-800',
            REVISION_REQUESTED: 'bg-orange-100 text-orange-800',
            UNDER_STAGE_2_REVIEW: 'bg-cyan-100 text-cyan-800',
            FINAL_ACCEPTED: 'bg-green-100 text-green-800',
            FINAL_REJECTED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
            {/* Hero Welcome Section */}
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 text-white overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, SRC Chair</h1>
                            <p className="text-blue-200 mt-2">Sunday, February 8, 2026</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span className="text-sm font-medium">Active Cycle: CTRG 2026-2027</span>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <RefreshCw size={18} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-medium">{stats?.awaiting_decision || 0} proposals need your attention</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusCards.map((card, idx) => (
                    <div key={idx} className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ backgroundColor: card.bgColor.replace('bg-', '') }} />
                        </div>

                        {/* Left accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bgColor}`} />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">{card.value}</p>
                            </div>
                            <div className={`p-3 ${card.bgColor} rounded-lg`}>
                                <card.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-Column Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Status Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Proposal Status Distribution</h2>
                        <BarChart3 size={20} className="text-gray-400" />
                    </div>
                    <StatusChart data={stats?.status_breakdown || {}} />
                </div>

                {/* Right: Actions & Timeline (1/3 width) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                    <div className="space-y-2 mb-6">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                to={action.path}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
                                    <action.icon size={16} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                            </Link>
                        ))}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6 pt-6 border-t border-gray-200">Recent Activity</h3>
                    <ActivityTimeline activities={mockActivities.slice(0, 4)} />
                </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search proposals..."
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Link to="/admin/proposals" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
                <div className="space-y-3">
                    {recentProposals.map((proposal) => (
                        <div key={proposal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            {/* Status dot */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${proposal.status === 'FINAL_ACCEPTED' ? 'bg-green-500' :
                                    proposal.status === 'FINAL_REJECTED' ? 'bg-red-500' :
                                        proposal.status === 'REVISION_REQUESTED' ? 'bg-orange-500' :
                                            'bg-blue-500'
                                }`} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 truncate">{proposal.proposal_code}</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                        {proposal.status_display || proposal.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{proposal.title}</p>
                                <p className="text-xs text-gray-400">{proposal.pi_name}</p>
                            </div>
                            <Link to={`/admin/proposals/${proposal.id}`} className="ml-4 text-gray-400 hover:text-blue-600">
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cycle Progress Footer */}
            <CycleProgress
                currentStage="stage1"
                stage1Complete={65}
                stage2Complete={0}
                stage1Date="Jan 15 - Mar 15"
                revisionDate="Mar 16 - Apr 15"
                stage2Date="Apr 16 - May 30"
                stats={{
                    stage1Proposals: stats?.pending_reviews || 8,
                    revisionProposals: stats?.awaiting_revision || 3,
                    stage2Proposals: 0,
                }}
            />
        </div>
    );
};

export default SRCChairDashboard;
