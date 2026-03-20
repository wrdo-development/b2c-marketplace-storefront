import { format } from 'date-fns';

import { Avatar } from '@/components/atoms';
import { OrderParcelActions } from '@/components/molecules/OrderParcelActions/OrderParcelActions';
import { OrderParcelItems } from '@/components/molecules/OrderParcelItems/OrderParcelItems';
import { OrderParcelStatus } from '@/components/molecules/OrderParcelStatus/OrderParcelStatus';
import { retrieveCustomer } from '@/lib/data/customer';

import { Chat } from '../Chat/Chat';

function tryFormat(date: string) {
  try {
    return format(new Date(date), 'dd.MM.yyyy');
  } catch {
    return null;
  }
}

export const OrderParcels = async ({ orders }: { orders: any[] }) => {
  const user = await retrieveCustomer();

  return (
    <>
      {orders.map((order, index) => {
        const raw = order.fulfillments?.[0]?.delivered_at;

        const deliveryDate = raw ? tryFormat(raw) || (typeof raw === 'string' ? raw : null) : null;

        const label = deliveryDate ? 'Delivery date' : undefined;
        const dateDisplay = deliveryDate;

        const canceledItems = order.canceled_items ?? [];

        return (
          <div
            key={order.id}
            className="mb-8 w-full"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border bg-component-secondary p-4 font-semibold uppercase text-primary">
              <span>Parcel {index + 1}</span>
              <div className="label-md flex flex-wrap items-center gap-4 font-normal normal-case text-secondary">
                <span>
                  Order: <span className="text-primary">#{order.display_id}</span>
                </span>
                {label && (
                  <span>
                    {label}: <span className="text-primary">{dateDisplay}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-sm border">
              <div className="border-b p-4">
                <OrderParcelStatus order={order} />
              </div>
              <div className="items-center justify-between border-b p-4 md:flex">
                <div className="mb-4 flex items-center gap-4 md:mb-0">
                  <Avatar src={order.seller.photo} />
                  <p className="text-primary">{order.seller.name}</p>
                </div>
                <Chat
                  user={user}
                  seller={order.seller}
                  order_id={order.id}
                  buttonClassNames="label-md text-action-on-secondary uppercase flex items-center gap-2"
                />
              </div>
              {order.items?.length > 0 && (
                <div className={order.status !== 'canceled' ? 'border-b p-4' : 'p-4'}>
                  <OrderParcelItems
                    items={order.items}
                    currency_code={order.currency_code}
                    isCanceled={order.status === 'canceled'}
                  />
                </div>
              )}
              {order.status !== 'canceled' && canceledItems.length > 0 && (
                <div className="border-b p-4">
                  <OrderParcelItems
                    items={canceledItems}
                    currency_code={order.currency_code}
                    isCanceled={true}
                  />
                </div>
              )}
              {order.status !== 'canceled' && <OrderParcelActions order={order} />}
            </div>
          </div>
        );
      })}
    </>
  );
};
