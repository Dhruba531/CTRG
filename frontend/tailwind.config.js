/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Navy & Gold Primary Colors
                navy: {
                    DEFAULT: '#1e2a4a',
                    light: '#2a3a5f',
                    dark: '#141d33',
                },
                gold: {
                    DEFAULT: '#d4a017',
                    light: '#e6b526',
                    dark: '#b8850c',
                },
                // Surface Colors
                surface: {
                    DEFAULT: '#f8f9fa',
                    elevated: '#ffffff',
                    hover: '#f3f4f6',
                    active: '#e5e7eb',
                },
                // Proposal Status Colors (WCAG AA Compliant)
                status: {
                    draft: '#9ca3af',
                    submitted: '#3b82f6',
                    'under-stage1': '#f59e0b',
                    'stage1-rejected': '#ef4444',
                    'accepted-no-corrections': '#22c55e',
                    'tentatively-accepted': '#f97316',
                    'revision-requested': '#a855f7',
                    'revised-submitted': '#8b5cf6',
                    'under-stage2': '#06b6d4',
                    'final-accepted': '#10b981',
                    'final-rejected': '#dc2626',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            fontSize: {
                xs: ['12px', { lineHeight: '16px' }],
                sm: ['14px', { lineHeight: '20px' }],
                base: ['16px', { lineHeight: '24px' }],
                lg: ['20px', { lineHeight: '28px' }],
                xl: ['24px', { lineHeight: '32px' }],
                '2xl': ['30px', { lineHeight: '36px' }],
                '3xl': ['36px', { lineHeight: '40px' }],
            },
            spacing: {
                xs: '8px',
                sm: '16px',
                md: '24px',
                lg: '32px',
                xl: '40px',
                '2xl': '48px',
            },
            borderRadius: {
                sm: '6px',
                DEFAULT: '8px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '20px',
                '3xl': '24px',
            },
            boxShadow: {
                flat: '0 1px 2px rgba(0, 0, 0, 0.05)',
                raised: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
                floating: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
            },
            transitionDuration: {
                fast: '200ms',
                normal: '300ms',
                slow: '500ms',
            },
            transitionTimingFunction: {
                'out-smooth': 'cubic-bezier(0, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
}
