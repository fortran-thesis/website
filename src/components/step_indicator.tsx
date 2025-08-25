{/* This is the step indicator component
  It visually represents the current step in a multi-step process.
  Parameters:
  - length: The total number of steps in the process.
*/}

type StepIndicatorProps = {
  length: number;
};

export default function StepIndicator({ length }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-x-2">
      {Array.from({ length }, (_, i) => (
        <div
          key={i}
          className={`w-25 h-1.5 ${
            i === 0 ? "bg-[var(--accent-color)]" : "bg-gray-300"
          } rounded-md`}
        ></div>
      ))}
    </div>
  );
}