import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Shield,
    ClipboardCheck,
    BarChart3,
    Users,
    Mail,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

type Role = 'src_chair' | 'reviewer' | 'pi';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('src_chair');
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const roleOptions = [
        { value: 'src_chair' as Role, label: 'SRC Chair', icon: Shield },
        { value: 'reviewer' as Role, label: 'Reviewer', icon: ClipboardCheck },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await login(email, password);

            // Redirect based on actual user role from backend response
            const userRole = response.role?.toLowerCase();

            if (userRole === 'src_chair' || userRole === 'admin' || response.user.is_staff) {
                navigate('/admin/dashboard');
            } else if (userRole === 'reviewer') {
                navigate('/reviewer/dashboard');
            } else if (userRole === 'pi') {
                navigate('/pi/dashboard');
            } else {
                // Fallback based on email if role is missing (legacy)
                if (email.includes('admin')) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/reviewer/dashboard');
                }
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Branding Panel - Desktop Only */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Navy Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,22%)]" />

                {/* Dot Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Top Section */}
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        {/* Icon */}
                        <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center mb-8">
                            <GraduationCap size={48} className="text-gold" />
                        </div>

                        {/* Title */}
                        <h1 className="font-serif text-5xl font-bold mb-4">CTRG</h1>

                        {/* Subtitle */}
                        <p className="text-lg opacity-80 max-w-md mb-8">
                            Two-Stage Research Grant Review Management System
                        </p>

                        {/* University Info */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">North South University</p>
                            <div className="w-12 h-px bg-gold mx-auto" />
                            <p className="text-xs opacity-70">School of Engineering and Physical Sciences | SRC</p>
                        </div>
                    </div>

                    {/* Bottom Features */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                <Shield size={20} className="text-gold" />
                            </div>
                            <span className="text-sm">Secure Two-Stage Review</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                <BarChart3 size={20} className="text-gold" />
                            </div>
                            <span className="text-sm">Data-Driven Decisions</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                <Users size={20} className="text-gold" />
                            </div>
                            <span className="text-sm">Multi-Role Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Banner - Visible Only on Mobile */}
            <div className="lg:hidden bg-gradient-to-br from-navy to-navy-dark py-12 px-6 text-white text-center">
                <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
                    <GraduationCap size={32} className="text-gold" />
                </div>
                <h1 className="font-serif text-3xl font-bold mb-2">CTRG</h1>
                <p className="text-sm opacity-80">North South University</p>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="font-serif text-3xl font-bold text-navy mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selector Cards */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Your Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {roleOptions.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = selectedRole === role.value;

                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setSelectedRole(role.value)}
                                            className={`
                                                flex flex-col items-center gap-2 p-4 rounded-lg border-2 
                                                transition-all duration-200 hover:scale-105
                                                ${isSelected
                                                    ? 'border-gold bg-gold/5 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <Icon
                                                size={24}
                                                className={isSelected ? 'text-gold' : 'text-gray-400'}
                                            />
                                            <span className={`text-xs font-medium ${isSelected ? 'text-navy' : 'text-gray-600'}`}>
                                                {role.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="your.email@nsu.edu"
                                    className="input pl-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input pl-11 pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                                />
                                <span className="text-gray-700">Remember me</span>
                            </label>
                            <a href="#" className="text-navy hover:text-gold transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Sign In Button - Gold Background */}
                        <button
                            type="submit"
                            className="btn btn-primary w-full btn-lg font-semibold"
                        >
                            Sign In
                        </button>

                        {/* Demo Credentials Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">Demo Credentials:</p>
                            <div className="space-y-1 text-xs text-gray-600 font-mono">
                                <p>• admin@nsu.edu</p>
                                <p>• reviewer@nsu.edu</p>
                                <p>• pi@nsu.edu</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Password: (any password)</p>
                        </div>

                        {/* Registration Section */}
                        <div className="text-center text-sm text-gray-600 py-4 border-t border-gray-200">
                            <p className="mb-2">Don't have an account?</p>
                            <button
                                type="button"
                                onClick={() => navigate('/register-reviewer')}
                                className="text-navy hover:text-gold transition-colors font-medium underline"
                            >
                                Register as Reviewer
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-sm text-gray-600">
                            Having trouble?{' '}
                            <a href="mailto:src@nsu.edu" className="text-navy hover:text-gold transition-colors font-medium">
                                Contact src@nsu.edu
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
