/**
 * Cycle Progress Component
 * Visual timeline showing grant cycle progress through stages
 */
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface CycleProgressProps {
    currentStage: 'stage1' | 'revision' | 'stage2' | 'completed';
    stage1Complete: number; // percentage
    stage2Complete: number; // percentage
    stage1Date?: string;
    revisionDate?: string;
    stage2Date?: string;
    stats?: {
        stage1Proposals?: number;
        revisionProposals?: number;
        stage2Proposals?: number;
    };
}

export function CycleProgress({
    currentStage,
    stage1Complete,
    stage2Complete,
    stage1Date,
    revisionDate,
    stage2Date,
    stats,
}: CycleProgressProps) {
    const stages = [
        {
            id: 'stage1',
            label: 'Stage 1 Review',
            date: stage1Date,
            complete: stage1Complete,
            count: stats?.stage1Proposals,
        },
        {
            id: 'revision',
            label: 'Revision Period',
            date: revisionDate,
            complete: currentStage === 'stage2' || currentStage === 'completed' ? 100 : 0,
            count: stats?.revisionProposals,
        },
        {
            id: 'stage2',
            label: 'Stage 2 Review',
            date: stage2Date,
            complete: stage2Complete,
            count: stats?.stage2Proposals,
        },
    ];

    const getStageStatus = (stageId: string) => {
        if (stageId === currentStage) return 'active';
        const stageOrder = ['stage1', 'revision', 'stage2', 'completed'];
        const currentIndex = stageOrder.indexOf(currentStage);
        const stageIndex = stageOrder.indexOf(stageId);
        return stageIndex < currentIndex ? 'completed' : 'upcoming';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Grant Cycle Progress</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Overall Progress:</span>
                    <span className="text-lg font-bold text-blue-600">
                        {Math.round((stage1Complete + stage2Complete) / 2)}%
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

                {/* Progress bar fill */}
                <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${(stage1Complete + stage2Complete) / 2}%` }}
                />

                {/* Stage indicators */}
                <div className="relative flex justify-between">
                    {stages.map((stage) => {
                        const status = getStageStatus(stage.id);
                        const isActive = status === 'active';
                        const isCompleted = status === 'completed';

                        return (
                            <div key={stage.id} className="flex flex-col items-center" style={{ width: '33%' }}>
                                {/* Icon */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle size={20} />
                                    ) : isActive ? (
                                        <Clock size={20} className="animate-pulse" />
                                    ) : (
                                        <Circle size={20} />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}
                                    >
                                        {stage.label}
                                    </p>
                                    {stage.date && (
                                        <p className="text-xs text-gray-400 mt-1">{stage.date}</p>
                                    )}
                                    {stage.count !== undefined && (
                                        <div className="mt-2">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : isCompleted
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {stage.count} proposals
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CycleProgress;
