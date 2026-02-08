/**
 * Badge Component
 * Status badges for proposal states and categories.
 */
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'gray';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    dot?: boolean;
    size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    gray: 'bg-gray-100 text-gray-600',
};

const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gray: 'bg-gray-500',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({
    className,
    variant = 'default',
    dot = false,
    size = 'md',
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-medium',
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
            )}
            {children}
        </span>
    );
}

// Status-specific badges for proposals
export const proposalStatusBadge = (status: string): { variant: BadgeVariant; label: string } => {
    const mapping: Record<string, { variant: BadgeVariant; label: string }> = {
        DRAFT: { variant: 'gray', label: 'Draft' },
        SUBMITTED: { variant: 'blue', label: 'Submitted' },
        UNDER_STAGE_1_REVIEW: { variant: 'yellow', label: 'Stage 1 Review' },
        STAGE_1_REJECTED: { variant: 'red', label: 'Rejected' },
        ACCEPTED_NO_CORRECTIONS: { variant: 'green', label: 'Accepted' },
        TENTATIVELY_ACCEPTED: { variant: 'yellow', label: 'Tentatively Accepted' },
        REVISION_REQUESTED: { variant: 'purple', label: 'Revision Requested' },
        REVISED_PROPOSAL_SUBMITTED: { variant: 'purple', label: 'Revised Submitted' },
        UNDER_STAGE_2_REVIEW: { variant: 'cyan', label: 'Stage 2 Review' },
        FINAL_ACCEPTED: { variant: 'green', label: 'Final Accepted' },
        FINAL_REJECTED: { variant: 'red', label: 'Final Rejected' },
        REVISION_DEADLINE_MISSED: { variant: 'red', label: 'Deadline Missed' },
    };

    return mapping[status] || { variant: 'gray', label: status };
};

export default Badge;
