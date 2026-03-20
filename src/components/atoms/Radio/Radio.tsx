import { cn } from '@/lib/utils';

type RadioIndicatorProps = {
  selected: boolean;
  hasError?: boolean;
  'data-testid'?: string;
};

export const Radio = ({ selected, hasError, 'data-testid': dataTestId }: RadioIndicatorProps) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-state={selected ? 'checked' : 'unchecked'}
      className="flex shrink-0 items-center justify-center p-[10px] outline-none"
      data-testid={dataTestId}
    >
      <div
        className={cn(
          'flex size-5 items-center justify-center rounded-full border',
          selected
            ? 'border-action bg-component-secondary'
            : hasError
              ? 'border-negative bg-component-secondary'
              : 'border-secondary bg-component-secondary'
        )}
      >
        {selected && <div className="size-3 rounded-full bg-action" />}
      </div>
    </button>
  );
};
