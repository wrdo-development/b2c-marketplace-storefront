import { HttpTypes } from '@medusajs/types';
import Image from 'next/image';

import { DeleteCartItemButton } from '@/components/molecules/DeleteCartItemButton/DeleteCartItemButton';
import { UpdateCartItemButton } from '@/components/molecules/UpdateCartItemButton/UpdateCartItemButton';
import { convertToLocale } from '@/lib/helpers/money';

export const CartDropdownItem = ({
  item,
  currency_code
}: {
  item: HttpTypes.StoreCartLineItem;
  currency_code: string;
}) => {
  const hasDiscount = (item.discount_total ?? 0) > 0;

  const original_total = convertToLocale({
    amount: item.original_total ?? 0,
    currency_code
  });

  const total = convertToLocale({
    amount: item.total ?? 0,
    currency_code
  });

  const vendor = item.product?.vendor;

  return (
    <div className="flex items-start rounded-sm border">
      <div className="w-[74px] shrink-0 p-1">
        <div className="relative h-[96px] w-full overflow-hidden rounded-xs">
          {item.thumbnail ? (
            <Image
              src={decodeURIComponent(item.thumbnail)}
              alt={item.product_title || ''}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src={'/images/placeholder.svg'}
                alt="Product thumbnail"
                width={40}
                height={53}
                className="object-contain opacity-30"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            {vendor && <p className="label-md text-secondary">{vendor}</p>}
            <h4 className="heading-xs truncate">{item.product_title}</h4>
          </div>
          <div className="label-md text-secondary">
            {item.variant?.options?.map(({ option, id, value }) => (
              <p key={id}>
                {option?.title}: <span className="text-primary">{value}</span>
              </p>
            ))}
          </div>
          <div>
            {hasDiscount && (
              <p className="label-md text-secondary line-through">{original_total}</p>
            )}
            <p className="label-lg text-primary">{total}</p>
          </div>
        </div>

        <div className="flex w-10 shrink-0 flex-col items-end justify-between self-stretch">
          <DeleteCartItemButton id={item.id} />
          <UpdateCartItemButton
            quantity={item.quantity}
            lineItemId={item.id}
          />
        </div>
      </div>
    </div>
  );
};
