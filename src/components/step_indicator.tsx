{/* This is the step indicator component
  It visually represents the current step in a multi-step process.
  Parameters:
  - length: The total number of steps in the process.
  - currentStep: The current step the user is on.
*/}


type StepIndicatorProps = {
    length: number;
    currentStep: number; 
};

export default function StepIndicator({ length, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center gap-x-2">
            {Array.from({ length }, (_, i) => (
                <div
                    key={i}
                    className={`w-20 h-1.5 ${
                        i < currentStep
                            ? "bg-[var(--accent-color)]"
                            : "bg-[var(--moldify-softGrey)]"
                    } rounded-md`}
                ></div>
            ))}
        </div>
    );
}