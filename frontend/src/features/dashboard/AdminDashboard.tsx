import React, { useState, useEffect } from 'react';
import { Download, Clock, Filter, Search } from 'lucide-react';
import { dashboardApi, proposalApi, type Proposal } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_proposals: 0,
        pending_reviews: 0,
        awaiting_decision: 0,
        awaiting_revision: 0
    });
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, proposalsRes] = await Promise.all([
                dashboardApi.getSrcChairStats(),
                proposalApi.getAll()
            ]);

            setStats({
                total_proposals: statsRes.data.total_proposals,
                pending_reviews: statsRes.data.pending_reviews,
                awaiting_decision: statsRes.data.awaiting_decision,
                awaiting_revision: statsRes.data.awaiting_revision,
            });
            setProposals(proposalsRes.data);
            setError(null);
        } catch (err) {
            console.error("Failed to load admin dashboard", err);
            setError("Failed to load dashboard data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProposals = proposals.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.pi_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleRunTimer = () => {
        // Placeholder for future implementation
        alert('Deadline check triggered (Background Task)');
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <div className="flex space-x-3">
                    <button onClick={handleRunTimer} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
                        <Clock size={16} className="mr-2" />
                        Run Deadline Check
                    </button>
                    <button
                        onClick={() => navigate('/admin/cycles')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        + New Grant Cycle
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Proposals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_proposals}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.pending_reviews}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Awaiting Decision</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.awaiting_decision}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Revision Requested</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.awaiting_revision}</p>
                </div>
            </div>

            {/* Data Grid Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search proposals or PI..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center">
                    <Filter size={16} className="text-gray-400 mr-2" />
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_STAGE_1_REVIEW">Review Stage 1</option>
                        <option value="REVISION_REQUESTED">Revision Requested</option>
                        <option value="REVISED_PROPOSAL_SUBMITTED">Revised Submitted</option>
                        <option value="UNDER_STAGE_2_REVIEW">Review Stage 2</option>
                        <option value="FINAL_ACCEPTED">Funded</option>
                    </select>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PI</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProposals.map((proposal) => (
                            <tr key={proposal.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proposal.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.pi_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.cycle_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${proposal.status === 'REVISION_REQUESTED' ? 'bg-orange-100 text-orange-800' :
                                            proposal.status === 'FINAL_ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                proposal.status === 'STAGE_1_REJECTED' || proposal.status === 'FINAL_REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                        }`}>
                                        {proposal.status_display || proposal.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/admin/proposals/${proposal.id}`)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        View
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600 inline-flex items-center">
                                        <Download size={14} className="mr-1" /> Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredProposals.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mb-2">No proposals found</div>
                    <div className="text-sm text-gray-500">Try adjusting your filters or search terms</div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
