import { Circle } from 'lucide-react';

// Status color mapping - WCAG AA compliant
const statusColors = {
    // Draft status
    'DRAFT': 'bg-gray-100 text-gray-700 border-gray-300',
    'Draft': 'bg-gray-100 text-gray-700 border-gray-300',

    // Submitted status
    'SUBMITTED': 'bg-blue-50 text-blue-700 border-blue-300',
    'Submitted': 'bg-blue-50 text-blue-700 border-blue-300',

    // Under Stage 1 Review
    'UNDER_STAGE_1_REVIEW': 'bg-amber-50 text-amber-700 border-amber-300',
    'Under Stage 1 Review': 'bg-amber-50 text-amber-700 border-amber-300',

    // Stage 1 Rejected
    'STAGE_1_REJECTED': 'bg-red-50 text-red-700 border-red-300',
    'Stage 1 Rejected': 'bg-red-50 text-red-700 border-red-300',

    // Accepted (no corrections needed)
    'ACCEPTED_NO_CORRECTIONS': 'bg-green-50 text-green-700 border-green-300',
    'Accepted (No Corrections)': 'bg-green-50 text-green-700 border-green-300',

    // Tentatively Accepted
    'TENTATIVELY_ACCEPTED': 'bg-orange-50 text-orange-700 border-orange-300',
    'Tentatively Accepted': 'bg-orange-50 text-orange-700 border-orange-300',

    // Revision Requested
    'REVISION_REQUESTED': 'bg-purple-50 text-purple-700 border-purple-300',
    'Revision Requested': 'bg-purple-50 text-purple-700 border-purple-300',

    // Revised Submitted
    'REVISED_SUBMITTED': 'bg-violet-50 text-violet-700 border-violet-300',
    'Revised Submitted': 'bg-violet-50 text-violet-700 border-violet-300',

    // Under Stage 2 Review
    'UNDER_STAGE_2_REVIEW': 'bg-cyan-50 text-cyan-700 border-cyan-300',
    'Under Stage 2 Review': 'bg-cyan-50 text-cyan-700 border-cyan-300',

    // Final Accepted
    'FINAL_ACCEPTED': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Final Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'FUNDED': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Funded': 'bg-emerald-50 text-emerald-700 border-emerald-300',

    // Final Rejected
    'FINAL_REJECTED': 'bg-rose-50 text-rose-700 border-rose-300',
    'Final Rejected': 'bg-rose-50 text-rose-700 border-rose-300',
    'REJECTED': 'bg-rose-50 text-rose-700 border-rose-300',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-300',
};

// Status dot colors for the leading indicator
const statusDotColors = {
    'DRAFT': '#9ca3af',
    'Draft': '#9ca3af',
    'SUBMITTED': '#3b82f6',
    'Submitted': '#3b82f6',
    'UNDER_STAGE_1_REVIEW': '#f59e0b',
    'Under Stage 1 Review': '#f59e0b',
    'STAGE_1_REJECTED': '#ef4444',
    'Stage 1 Rejected': '#ef4444',
    'ACCEPTED_NO_CORRECTIONS': '#22c55e',
    'Accepted (No Corrections)': '#22c55e',
    'TENTATIVELY_ACCEPTED': '#f97316',
    'Tentatively Accepted': '#f97316',
    'REVISION_REQUESTED': '#a855f7',
    'Revision Requested': '#a855f7',
    'REVISED_SUBMITTED': '#8b5cf6',
    'Revised Submitted': '#8b5cf6',
    'UNDER_STAGE_2_REVIEW': '#06b6d4',
    'Under Stage 2 Review': '#06b6d4',
    'FINAL_ACCEPTED': '#10b981',
    'Final Accepted': '#10b981',
    'FUNDED': '#10b981',
    'Funded': '#10b981',
    'FINAL_REJECTED': '#dc2626',
    'Final Rejected': '#dc2626',
    'REJECTED': '#dc2626',
    'Rejected': '#dc2626',
};

interface StatusBadgeProps {
    status: string;
    showDot?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, showDot = true, size = 'md' }: StatusBadgeProps) {
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-300';
    const dotColor = statusDotColors[status as keyof typeof statusDotColors] || '#9ca3af';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    const dotSizes = {
        sm: 4,
        md: 6,
        lg: 8
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${colorClass} ${sizeClasses[size]} whitespace-nowrap`}
        >
            {showDot && (
                <Circle
                    size={dotSizes[size]}
                    fill={dotColor}
                    stroke={dotColor}
                    className="flex-shrink-0"
                />
            )}
            {status}
        </span>
    );
}
