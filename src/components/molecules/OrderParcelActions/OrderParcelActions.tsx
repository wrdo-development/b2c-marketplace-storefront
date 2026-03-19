import { HttpTypes } from '@medusajs/types';

import { Divider } from '@/components/atoms';
import { OrderCancel } from '@/components/cells/OrderCancel/OrderCancel';
import { OrderReturn } from '@/components/cells/OrderReturn/OrderReturn';
import { OrderTrack } from '@/components/cells/OrderTrack/OrderTrack';
import { hasTrackingData } from '@/components/cells/OrderTrack/orderTrack.helpers';

const hasCancellableItems = (order: HttpTypes.StoreOrder) =>
  (order.items ?? []).some(item => item.quantity - (item.detail?.fulfilled_quantity ?? 0) > 0);

export const OrderParcelActions = ({ order }: { order: HttpTypes.StoreOrder }) => {
  if (order.fulfillment_status === 'delivered') {
    return (
      <div>
        {hasTrackingData(order) && (
          <>
            <div className="p-4">
              <OrderTrack order={order} />
            </div>
            <Divider />
          </>
        )}
        <div className="p-4">
          <OrderReturn order={order} />
        </div>
      </div>
    );
  }

  if (order.fulfillment_status === 'shipped')
    return (
      <div className="p-4">
        <OrderTrack order={order} />
      </div>
    );

  if (order.status === 'pending') {
    if (!hasCancellableItems(order)) return null;
    return (
      <div className="p-4">
        <OrderCancel order={order} />
      </div>
    );
  }

  return null;
};
