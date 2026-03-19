'use client';

import Link from 'next/link';

import { Button } from '@/components/atoms';

export const OrderReturn = ({ order }: { order: any }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-8 max-md:pr-0">
        <h2 className="heading-xs uppercase text-primary">Return Order</h2>
        <p className="label-md max-w-sm text-secondary">
          Once you receive your order, you will have [14] days to return items. Find out more about{' '}
          <Link
            href="/returns"
            className="underline"
          >
            returns and refunds
          </Link>
          .
        </p>
      </div>
      <Link href={`/user/orders/${order.id}/return`}>
        <Button
          variant="tonal"
          className="label-md uppercase text-action-on-secondary"
          onClick={() => null}
        >
          Return
        </Button>
      </Link>
    </div>
  );
};
