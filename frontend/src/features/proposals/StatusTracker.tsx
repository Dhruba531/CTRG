/**
 * Enhanced Status Tracker Component.
 * Visual timeline showing proposal progression through the 11-state workflow.
 */
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusTrackerProps {
    status: string;
}

interface Step {
    key: string;
    label: string;
    shortLabel: string;
}

const WORKFLOW_STEPS: Step[] = [
    { key: 'SUBMITTED', label: 'Submitted', shortLabel: 'Submitted' },
    { key: 'UNDER_STAGE_1_REVIEW', label: 'Stage 1 Review', shortLabel: 'Stage 1' },
    { key: 'STAGE_1_DECISION', label: 'Stage 1 Decision', shortLabel: 'Decision' },
    { key: 'REVISION', label: 'Revision', shortLabel: 'Revision' },
    { key: 'UNDER_STAGE_2_REVIEW', label: 'Stage 2 Review', shortLabel: 'Stage 2' },
    { key: 'FINAL_DECISION', label: 'Final Decision', shortLabel: 'Final' },
];

// Map statuses to workflow position and state
const STATUS_MAP: Record<string, { step: number; state: 'completed' | 'current' | 'pending' | 'rejected' | 'warning' }> = {
    SUBMITTED: { step: 0, state: 'current' },
    UNDER_STAGE_1_REVIEW: { step: 1, state: 'current' },
    STAGE_1_REJECTED: { step: 2, state: 'rejected' },
    TENTATIVELY_ACCEPTED: { step: 2, state: 'warning' },
    REVISION_REQUESTED: { step: 3, state: 'warning' },
    REVISION_SUBMITTED: { step: 3, state: 'current' },
    REVISION_DEADLINE_MISSED: { step: 3, state: 'rejected' },
    UNDER_STAGE_2_REVIEW: { step: 4, state: 'current' },
    FINAL_ACCEPTED: { step: 5, state: 'completed' },
    FINAL_REJECTED: { step: 5, state: 'rejected' },
};

const StatusTracker: React.FC<StatusTrackerProps> = ({ status }) => {
    const statusInfo = STATUS_MAP[status] || { step: 0, state: 'pending' };
    const currentStep = statusInfo.step;
    const currentState = statusInfo.state;

    const getStepState = (index: number): 'completed' | 'current' | 'pending' | 'rejected' | 'warning' => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return currentState;
        return 'pending';
    };

    const getStepStyles = (state: 'completed' | 'current' | 'pending' | 'rejected' | 'warning') => {
        switch (state) {
            case 'completed':
                return {
                    circle: 'bg-green-500 text-white',
                    line: 'bg-green-500',
                    label: 'text-green-700 font-medium',
                    icon: <CheckCircle size={16} />,
                };
            case 'current':
                return {
                    circle: 'bg-blue-500 text-white animate-pulse',
                    line: 'bg-gray-300',
                    label: 'text-blue-700 font-semibold',
                    icon: <Clock size={16} />,
                };
            case 'warning':
                return {
                    circle: 'bg-orange-500 text-white',
                    line: 'bg-gray-300',
                    label: 'text-orange-700 font-semibold',
                    icon: <AlertTriangle size={16} />,
                };
            case 'rejected':
                return {
                    circle: 'bg-red-500 text-white',
                    line: 'bg-gray-300',
                    label: 'text-red-700 font-medium',
                    icon: <XCircle size={16} />,
                };
            default:
                return {
                    circle: 'bg-gray-200 text-gray-400',
                    line: 'bg-gray-200',
                    label: 'text-gray-400',
                    icon: null,
                };
        }
    };

    return (
        <div className="py-4">
            <div className="flex items-center justify-between">
                {WORKFLOW_STEPS.map((step, index) => {
                    const state = getStepState(index);
                    const styles = getStepStyles(state);
                    const isLast = index === WORKFLOW_STEPS.length - 1;

                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.circle}`}>
                                    {styles.icon || <span className="text-xs">{index + 1}</span>}
                                </div>
                                <span className={`mt-2 text-xs text-center ${styles.label} hidden md:block`}>
                                    {step.label}
                                </span>
                                <span className={`mt-2 text-xs text-center ${styles.label} md:hidden`}>
                                    {step.shortLabel}
                                </span>
                            </div>
                            {!isLast && (
                                <div className={`flex-1 h-1 mx-2 rounded ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Current status message */}
            <div className="mt-4 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${currentState === 'completed' ? 'bg-green-100 text-green-800' :
                    currentState === 'rejected' ? 'bg-red-100 text-red-800' :
                        currentState === 'warning' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                    }`}>
                    {currentState === 'warning' && <AlertTriangle size={14} className="mr-1" />}
                    {currentState === 'rejected' && <XCircle size={14} className="mr-1" />}
                    {currentState === 'completed' && <CheckCircle size={14} className="mr-1" />}
                    {currentState === 'current' && <Clock size={14} className="mr-1" />}
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
        </div>
    );
};

export default StatusTracker;
