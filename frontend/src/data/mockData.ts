/**
 * Mock data for dashboard components
 */

export interface Activity {
    id: number;
    type: 'submission' | 'review' | 'decision' | 'revision';
    description: string;
    timestamp: string;
    user?: string;
}

export const mockActivities: Activity[] = [
    {
        id: 1,
        type: 'submission',
        description: 'Proposal CTRG-2026-004 submitted',
        timestamp: '2026-02-08T06:30:00',
        user: 'Dr. Rahman',
    },
    {
        id: 2,
        type: 'review',
        description: 'Review completed for CTRG-2026-003',
        timestamp: '2026-02-08T05:15:00',
        user: 'Dr. Smith',
    },
    {
        id: 3,
        type: 'decision',
        description: 'CTRG-2026-002 tentatively accepted',
        timestamp: '2026-02-08T04:00:00',
    },
    {
        id: 4,
        type: 'revision',
        description: 'Revised proposal submitted',
        timestamp: '2026-02-08T02:45:00',
        user: 'Dr. Chen',
    },
    {
        id: 5,
        type: 'submission',
        description: 'New proposal CTRG-2026-005 submitted',
        timestamp: '2026-02-07T23:30:00',
        user: 'Dr. Johnson',
    },
];
