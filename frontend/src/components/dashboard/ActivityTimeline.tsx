/**
 * Activity Timeline Component
 * Displays recent system activities in a vertical timeline format
 */
import { FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '../../data/mockData';

interface ActivityTimelineProps {
    activities: Activity[];
}

const activityConfig = {
    submission: {
        icon: FileText,
        color: 'bg-blue-500',
        dotColor: 'bg-blue-500',
    },
    review: {
        icon: CheckCircle,
        color: 'bg-green-500',
        dotColor: 'bg-green-500',
    },
    decision: {
        icon: AlertCircle,
        color: 'bg-purple-500',
        dotColor: 'bg-purple-500',
    },
    revision: {
        icon: RefreshCw,
        color: 'bg-orange-500',
        dotColor: 'bg-orange-500',
    },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
    return (
        <div className="space-y-4">
            {activities.map((activity, index) => {
                const config = activityConfig[activity.type];
                const isLast = index === activities.length - 1;

                return (
                    <div key={activity.id} className="relative flex gap-3">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-2 top-8 bottom-0 w-px bg-gray-200" />
                        )}

                        {/* Icon dot */}
                        <div className={`relative z-10 flex-shrink-0 w-4 h-4 rounded-full ${config.dotColor} mt-1`}>
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-4">
                            <p className="text-sm text-gray-900 font-medium leading-tight">
                                {activity.description}
                            </p>
                            {activity.user && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    by {activity.user}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ActivityTimeline;
