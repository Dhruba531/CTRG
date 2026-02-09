import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../../services/authService';

import type { LoginResponse } from '../../services/authService';

interface AuthContextType {
    user: any;
    role: string | null;
    token: string | null;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = authService.getToken();
        const storedRole = authService.getRole();
        const storedUser = authService.getUser();

        if (storedToken) {
            setToken(storedToken);
            setRole(storedRole);
            setUser(storedUser);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authService.login(email, password);
        setToken(data.access);
        setRole(data.role);
        setUser(data.user);

        localStorage.setItem('token', data.access);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setRole(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
