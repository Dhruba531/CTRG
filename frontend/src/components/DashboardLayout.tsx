/**
 * Enhanced Dashboard Layout Component.
 * Modern layout with collapsible sidebar and smooth animations.
 */
import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
    LayoutDashboard, FileText, CheckSquare, LogOut,
    Calendar, Users, BarChart3, ChevronLeft, Menu, GraduationCap, Plus, UserCheck, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
}

interface RouteGuide {
    pageTitle: string;
    heading: string;
    description: string;
    steps: string[];
    actionLabel?: string;
    actionPath?: string;
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
    { to: '/admin/pending-reviewers', icon: UserCheck, label: 'Pending Reviewers' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const getRouteGuide = (role: string | null, pathname: string): RouteGuide => {
    if (role === 'SRC_Chair') {
        if (pathname.startsWith('/admin/proposals')) {
            return {
                pageTitle: 'Proposal Management',
                heading: 'Review and move proposals through each stage',
                description: 'Use this page to assign reviewers, send notifications, and apply stage/final decisions.',
                steps: [
                    'Open a proposal and check its current status.',
                    'Assign reviewers and send notifications for pending assignments.',
                    'Apply Stage 1 or Final decision when required reviews are complete.'
                ],
                actionLabel: 'View Proposals',
                actionPath: '/admin/proposals'
            };
        }
        if (pathname.startsWith('/admin/cycles')) {
            return {
                pageTitle: 'Grant Cycle Management',
                heading: 'Configure the active cycle before processing proposals',
                description: 'Set review windows, thresholds, and reviewer limits so workflows behave correctly.',
                steps: [
                    'Create or update the current cycle dates.',
                    'Set acceptance threshold and reviewer limits.',
                    'Confirm the correct cycle is marked active.'
                ],
                actionLabel: 'Manage Cycles',
                actionPath: '/admin/cycles'
            };
        }
        if (pathname.startsWith('/admin/reviewers')) {
            return {
                pageTitle: 'Reviewer Management',
                heading: 'Keep reviewer profiles complete and available',
                description: 'Add reviewers manually or import via Excel, then tune workload settings.',
                steps: [
                    'Create/import reviewer accounts.',
                    'Set expertise and max review load.',
                    'Activate reviewers who are ready to receive assignments.'
                ],
                actionLabel: 'Open Reviewer List',
                actionPath: '/admin/reviewers'
            };
        }
        if (pathname.startsWith('/admin/pending-reviewers')) {
            return {
                pageTitle: 'Pending Reviewer Approvals',
                heading: 'Approve or reject reviewer registrations',
                description: 'Only approved reviewers can log in and receive assignments.',
                steps: [
                    'Review pending profile details.',
                    'Approve valid reviewers to activate their account.',
                    'Reject incomplete or invalid requests.'
                ],
                actionLabel: 'Review Pending Requests',
                actionPath: '/admin/pending-reviewers'
            };
        }
        if (pathname.startsWith('/admin/reports')) {
            return {
                pageTitle: 'Reports',
                heading: 'Generate proposal and cycle reports',
                description: 'Export reports for operational tracking and official records.',
                steps: [
                    'Select the proposal or cycle you want to report on.',
                    'Generate the PDF report.',
                    'Download and archive the report.'
                ],
                actionLabel: 'Open Reports',
                actionPath: '/admin/reports'
            };
        }
        return {
            pageTitle: 'Overview',
            heading: 'Start here to run the full review operation',
            description: 'Use the dashboard numbers to decide what needs action first.',
            steps: [
                'Check pending reviews and proposals awaiting decisions.',
                'Go to Proposals to assign reviewers or decide outcomes.',
                'Monitor pending reviewer approvals and reports regularly.'
            ],
            actionLabel: 'Go to Proposals',
            actionPath: '/admin/proposals'
        };
    }

    if (role === 'Reviewer') {
        if (pathname.startsWith('/reviewer/reviews/') && pathname.endsWith('/stage2')) {
            return {
                pageTitle: 'Stage 2 Review Form',
                heading: 'Evaluate whether revision concerns were addressed',
                description: 'Compare original vs revised materials, then submit your recommendation.',
                steps: [
                    'Review original comments and revised documents.',
                    'Select concerns addressed level and recommendation.',
                    'Save draft or submit final review.'
                ],
                actionLabel: 'Back to My Reviews',
                actionPath: '/reviewer/reviews'
            };
        }
        if (pathname.startsWith('/reviewer/reviews/')) {
            return {
                pageTitle: 'Stage 1 Review Form',
                heading: 'Score all criteria and provide narrative comments',
                description: 'Your scoring drives Stage 1 decision quality.',
                steps: [
                    'Read proposal details carefully.',
                    'Score all criteria and add narrative comments.',
                    'Save draft if needed, then submit when complete.'
                ],
                actionLabel: 'Back to My Reviews',
                actionPath: '/reviewer/reviews'
            };
        }
        return {
            pageTitle: 'My Reviews',
            heading: 'Complete pending reviews by deadline',
            description: 'This dashboard shows all assignments and what still needs submission.',
            steps: [
                'Open each pending assignment.',
                'Complete Stage 1 or Stage 2 form fields.',
                'Submit final review before the deadline.'
            ],
            actionLabel: 'Open My Reviews',
            actionPath: '/reviewer/reviews'
        };
    }

    if (role === 'PI') {
        if (pathname.startsWith('/pi/proposals/') && pathname.endsWith('/revise')) {
            return {
                pageTitle: 'Revision Submission',
                heading: 'Submit your revised proposal package',
                description: 'Upload all required revised documents before the deadline.',
                steps: [
                    'Review requested revisions and comments.',
                    'Upload revised proposal and response document if available.',
                    'Submit and confirm status changed to Stage 2 review.'
                ],
                actionLabel: 'Back to Dashboard',
                actionPath: '/pi/dashboard'
            };
        }
        if (pathname.startsWith('/pi/proposals/') || pathname.startsWith('/pi/submit')) {
            return {
                pageTitle: 'Proposal Form',
                heading: 'Create or update your proposal details',
                description: 'Complete metadata and upload all required files before final submission.',
                steps: [
                    'Fill all required proposal information fields.',
                    'Upload proposal and application template files.',
                    'Submit when ready to enter Stage 1 review.'
                ],
                actionLabel: 'View Dashboard',
                actionPath: '/pi/dashboard'
            };
        }
        return {
            pageTitle: 'My Proposals',
            heading: 'Track submission progress and deadlines',
            description: 'Use this dashboard to monitor statuses and revision tasks.',
            steps: [
                'Check status of each submitted proposal.',
                'Open any proposal with revision requested.',
                'Submit revisions before the deadline and monitor final decision.'
            ],
            actionLabel: 'Create New Proposal',
            actionPath: '/pi/submit'
        };
    }

    return {
        pageTitle: 'Dashboard',
        heading: 'Use the navigation to continue',
        description: 'Choose a module from the left sidebar.',
        steps: [
            'Open the section you need.',
            'Follow the prompts on each page.',
            'Save or submit your work when complete.'
        ],
    };
};

const DashboardLayout: React.FC = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [currentDate, setCurrentDate] = useState(() =>
        new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = role === 'PI' ? piNavItems :
        role === 'Reviewer' ? reviewerNavItems : adminNavItems;

    const portalTitle = role === 'PI' ? 'PI Portal' :
        role === 'Reviewer' ? 'Reviewer Portal' : 'Admin Console';

    const routeGuide = getRouteGuide(role, location.pathname);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentDate(
                new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            );
        }, 60 * 1000);

        return () => window.clearInterval(intervalId);
    }, []);

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
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{portalTitle}</h2>
                        <p className="text-xs text-gray-500">{routeGuide.pageTitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {currentDate}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="animate-fade-in">
                        <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">{routeGuide.heading}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{routeGuide.description}</p>
                                </div>
                                {routeGuide.actionLabel && routeGuide.actionPath && (
                                    <Link
                                        to={routeGuide.actionPath}
                                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap"
                                    >
                                        {routeGuide.actionLabel}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                            <ol className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                                {routeGuide.steps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-2 rounded-lg bg-white/70 p-2">
                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
                                            {index + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
