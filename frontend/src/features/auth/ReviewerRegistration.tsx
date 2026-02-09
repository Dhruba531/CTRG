import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

const ReviewerRegistration: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/register-reviewer/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            });

            if (response.status === 201) {
                alert('Registration successful! Your account has been created and is pending approval from the SRC Chair. You will be able to login once your account is approved.');
                navigate('/login');
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData) {
                // Handle specific field errors
                const errorMessages = [];
                if (errorData.username) errorMessages.push(`Username: ${errorData.username}`);
                if (errorData.email) errorMessages.push(`Email: ${errorData.email}`);
                if (errorData.password) errorMessages.push(`Password: ${errorData.password}`);
                if (errorData.first_name) errorMessages.push(`First Name: ${errorData.first_name}`);
                if (errorData.last_name) errorMessages.push(`Last Name: ${errorData.last_name}`);

                if (errorMessages.length > 0) {
                    setError(errorMessages.join('\n'));
                } else {
                    setError('Registration failed. Please check your information and try again.');
                }
            } else {
                setError('Registration failed. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
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
                            <ClipboardCheck size={48} className="text-gold" />
                        </div>

                        {/* Title */}
                        <h1 className="font-serif text-5xl font-bold mb-4">Join as Reviewer</h1>

                        {/* Subtitle */}
                        <p className="text-lg opacity-80 max-w-md mb-8">
                            Register to become a reviewer for research grant proposals
                        </p>

                        {/* University Info */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">North South University</p>
                            <div className="w-12 h-px bg-gold mx-auto" />
                            <p className="text-xs opacity-70">School of Engineering and Physical Sciences | SRC</p>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="space-y-4">
                        <p className="text-sm opacity-75">
                            As a reviewer, you'll help evaluate research grant proposals and contribute
                            to advancing research at NSU.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile Banner - Visible Only on Mobile */}
            <div className="lg:hidden bg-gradient-to-br from-navy to-navy-dark py-12 px-6 text-white text-center">
                <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck size={32} className="text-gold" />
                </div>
                <h1 className="font-serif text-3xl font-bold mb-2">Reviewer Registration</h1>
                <p className="text-sm opacity-80">North South University</p>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-navy hover:text-gold transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Login</span>
                    </button>

                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="font-serif text-3xl font-bold text-navy mb-2">
                            Create Reviewer Account
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Fill in your details to register as a reviewer
                        </p>
                    </div>

                    {/* Approval Notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <ClipboardCheck size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-blue-900 mb-1">Account Approval Required</h3>
                                <p className="text-xs text-blue-700">
                                    Your registration will be reviewed by the SRC Chair. You'll be able to login once your account is approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="John"
                                        className="input pl-11"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Doe"
                                    className="input"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="john.doe"
                                    className="input pl-11"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
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
                                    name="email"
                                    placeholder="your.email@nsu.edu"
                                    className="input pl-11"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    placeholder="••••••••"
                                    className="input pl-11 pr-11"
                                    value={formData.password}
                                    onChange={handleChange}
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

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className="input pl-11 pr-11"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary w-full btn-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Registering...' : 'Register as Reviewer'}
                        </button>

                        {/* Footer */}
                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-navy hover:text-gold transition-colors font-medium"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewerRegistration;
