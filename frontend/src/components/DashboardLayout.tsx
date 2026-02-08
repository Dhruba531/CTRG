/**
 * Enhanced Dashboard Layout Component.
 * Modern layout with collapsible sidebar and smooth animations.
 */
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
    LayoutDashboard, FileText, CheckSquare, LogOut,
    Calendar, Users, BarChart3, ChevronLeft, Menu, GraduationCap, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
}

const piNavItems: NavItem[] = [
    { to: '/pi/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pi/submit', icon: Plus, label: 'New Proposal' },
];

const reviewerNavItems: NavItem[] = [
    { to: '/reviewer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reviewer/reviews', icon: CheckSquare, label: 'My Reviews' },
];

const adminNavItems: NavItem[] = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/proposals', icon: FileText, label: 'Proposals' },
    { to: '/admin/cycles', icon: Calendar, label: 'Grant Cycles' },
    { to: '/admin/reviewers', icon: Users, label: 'Reviewers' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const DashboardLayout: React.FC = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = role === 'PI' ? piNavItems :
        role === 'Reviewer' ? reviewerNavItems : adminNavItems;

    const portalTitle = role === 'PI' ? 'PI Portal' :
        role === 'Reviewer' ? 'Reviewer Portal' : 'Admin Console';

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={cn(
                    'sidebar border-r border-slate-800',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">CTRG</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to ||
                            (item.to !== '/admin/dashboard' && item.to !== '/pi/dashboard' && item.to !== '/reviewer/dashboard' &&
                                location.pathname.startsWith(item.to));

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'sidebar-nav-item-active'
                                        : 'sidebar-nav-item',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="border-t border-slate-800 p-3">
                    <div className={cn(
                        'flex items-center gap-3 rounded-lg p-2',
                        collapsed && 'justify-center'
                    )}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">
                                {user?.first_name?.[0] || 'U'}
                            </span>
                        </div>
                        {!collapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.first_name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">{portalTitle}</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
