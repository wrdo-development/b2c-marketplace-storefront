import { HttpTypes } from '@medusajs/types';

export const hasTrackingData = (order: HttpTypes.StoreOrder) => {
  const label = order?.fulfillments?.[0]?.labels?.[0];
  return !!(order.shipping_methods?.[0]?.name && label?.tracking_number);
};
