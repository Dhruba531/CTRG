import React, { useState } from 'react';
import { Download, Clock, Filter, Search } from 'lucide-react';

const MOCK_ALL_PROPOSALS = [
    { id: 1, title: 'AI for Climate Change', pi: 'Dr. Smith', cycle: 'Spring 2024', status: 'UNDER_REVIEW_STAGE_1' },
    { id: 2, title: 'Blockchain in Education', pi: 'Dr. Jones', cycle: 'Spring 2024', status: 'DRAFT' },
    { id: 3, title: 'Quantum Algo', pi: 'Dr. Doe', cycle: 'Spring 2024', status: 'STAGE_1_COMPLETED' },
    { id: 4, title: 'Bio-Informatics Study', pi: 'Dr. Alice', cycle: 'Spring 2024', status: 'REVISION_REQUESTED' },
];

const AdminDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredProposals = MOCK_ALL_PROPOSALS.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.pi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleRunTimer = () => {
        alert('Triggered Check Deadline Task');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <div className="flex space-x-3">
                    <button onClick={handleRunTimer} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
                        <Clock size={16} className="mr-2" />
                        Run Deadline Check
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        + New Grant Cycle
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Proposals</p>
                    <p className="text-2xl font-bold text-gray-900">{MOCK_ALL_PROPOSALS.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-blue-600">1</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Revision Requested</p>
                    <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Funded</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
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
                        <option value="UNDER_REVIEW_STAGE_1">Review Stage 1</option>
                        <option value="REVISION_REQUESTED">Revision</option>
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
                            <tr key={proposal.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proposal.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.pi}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.cycle}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${proposal.status === 'REVISION_REQUESTED' ? 'bg-red-100 text-red-800' :
                                            proposal.status === 'STAGE_1_COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {proposal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600 mr-4">Edit</button>
                                    <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                                        <Download size={14} className="mr-1" /> Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
