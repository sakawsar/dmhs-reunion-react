import React from 'react';

interface Step {
    label: string;
    icon: string;
}

interface ProgressBarProps {
    currentStep: number;
    steps: Step[];
    direction: 'forward' | 'back';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
    const fillPercent = ((currentStep) / (steps.length - 1)) * 100;

    return (
        <div className="progress-container">
            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${fillPercent}%` }} />
                {steps.map((step, idx) => (
                    <div key={idx} className="progress-step">
                        <div
                            className={`progress-dot ${idx < currentStep ? 'completed' : idx === currentStep ? 'active' : ''
                                }`}
                        >
                            {idx < currentStep ? '✓' : step.icon}
                        </div>
                        <span className={`progress-label ${idx === currentStep ? 'active' : ''}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;
