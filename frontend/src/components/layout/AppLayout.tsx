/**
 * App Layout Component
 * Main layout wrapper with sidebar navigation.
 */
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

export function AppLayout() {
    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
