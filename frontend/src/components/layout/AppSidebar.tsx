/**
 * App Sidebar Component
 * Collapsible sidebar navigation with role-based menu items.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    GraduationCap,
    BarChart3,
    UserCheck,
    Menu,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Grant Cycles', href: '/admin/cycles', icon: Calendar },
    { name: 'Proposals', href: '/admin/proposals', icon: FileText },
    { name: 'Reviewers', href: '/admin/reviewers', icon: UserCheck },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'flex flex-col bg-slate-900 text-white transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold">CTRG</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));

                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                collapsed && 'justify-center px-2'
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-slate-700 p-3">
                <div className={cn(
                    'flex items-center gap-3 rounded-lg p-2',
                    collapsed && 'justify-center'
                )}>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">SA</span>
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Dr. Sarah Ahmed</p>
                                <p className="text-xs text-slate-400 truncate">SRC Chair</p>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default AppSidebar;
