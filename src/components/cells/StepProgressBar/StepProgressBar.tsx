import { cn } from '@/lib/utils';

export const StepProgressBar = ({
  steps,
  currentStep
}: {
  steps: string[];
  currentStep: number;
}) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div
        className="grid w-full gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex min-w-0 items-center justify-center"
          >
            <span
              className={cn(
                'heading-xs text-center uppercase text-primary',
                index <= currentStep ? 'opacity-100' : 'opacity-20'
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div
        className="grid w-full items-center"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-center"
          >
            <span
              className={cn(
                'min-w-0 flex-1 border-t',
                index <= currentStep ? 'border-action' : 'border-primary'
              )}
              style={{ minHeight: 0 }}
            />
            <span
              className={cn(
                'shrink-0 rounded-xs',
                index <= currentStep ? 'bg-action' : 'border border-primary bg-primary'
              )}
              style={{ width: 8, height: 8 }}
            />
            <span
              className={cn(
                'min-w-0 flex-1 border-t',
                index + 1 <= currentStep ||
                  (currentStep === steps.length - 1 && index === steps.length - 1)
                  ? 'border-action'
                  : 'border-primary'
              )}
              style={{ minHeight: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
