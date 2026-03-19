'use client';

import { HttpTypes } from '@medusajs/types';

import { Button } from '@/components/atoms';

import { hasTrackingData } from './orderTrack.helpers';

const getFirstLabel = (order: HttpTypes.StoreOrder) => order?.fulfillments?.[0]?.labels?.[0];

export const OrderTrack = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const label = getFirstLabel(order);
  const carrier = order.shipping_methods?.[0]?.name;
  const trackingNumber = label?.tracking_number;
  const trackingUrl = label?.tracking_url;

  if (!hasTrackingData(order)) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="heading-xs uppercase text-primary">Track your order</h2>
        <p className="label-md text-secondary">See where your order is now.</p>
      </div>
      <div className="label-md flex flex-col gap-1">
        <span className="text-secondary">Carrier:</span>
        <span className="text-primary">{carrier}</span>
      </div>
      <div className="label-md flex flex-col gap-1">
        <span className="text-secondary">Tracking number:</span>
        <span className="text-primary">{trackingNumber}</span>
      </div>
      {!!trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            variant="tonal"
            className="label-md uppercase text-action-on-secondary"
          >
            Track
          </Button>
        </a>
      )}
    </div>
  );
};
