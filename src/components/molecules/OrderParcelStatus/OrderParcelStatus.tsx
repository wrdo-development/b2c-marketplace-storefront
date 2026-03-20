import { StepProgressBar } from '@/components/cells/StepProgressBar/StepProgressBar';
import { parcelStatuses, steps } from '@/lib/helpers/parcel-statuses';

export const OrderParcelStatus = ({ order }: { order: any }) => {
  if (order.status === 'canceled') {
    return <p className="heading-xs uppercase text-primary">Canceled</p>;
  }

  const currentStep = parcelStatuses(order.fulfillment_status);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <StepProgressBar
          steps={steps}
          currentStep={currentStep}
        />
      </div>
    </div>
  );
};
