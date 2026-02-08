/**
 * Card Component
 * Versatile card with header, content, footer sections.
 */
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    gradient: 'card-gradient text-white',
};

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({
    className,
    variant = 'default',
    hover = true,
    padding = 'none',
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                variantClasses[variant],
                paddingClasses[padding],
                !hover && 'hover:shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function CardHeader({
    className,
    title,
    subtitle,
    action,
    children,
    ...props
}: CardHeaderProps) {
    return (
        <div
            className={cn('px-6 py-4 border-b border-gray-100', className)}
            {...props}
        >
            {(title || subtitle || action) ? (
                <div className="flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            ) : children}
        </div>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50/50', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
