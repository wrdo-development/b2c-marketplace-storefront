import { HttpTypes } from '@medusajs/types';
import Image from 'next/image';

import { Button, Card } from '@/components/atoms';
import { convertToLocale } from '@/lib/helpers/money';

import { SelectedReturnItem } from './types';

export const ReturnSummaryTab = ({
  selectedItems,
  items,
  currency_code,
  handleTabChange,
  tab,
  returnMethod,
  handleSubmit,
  shippingMethods
}: {
  selectedItems: SelectedReturnItem[];
  items: HttpTypes.StoreOrderLineItem[];
  currency_code: string;
  handleTabChange: (tab: number) => void;
  tab: number;
  returnMethod: string | null;
  handleSubmit: () => void;
  shippingMethods: HttpTypes.StoreShippingOption[];
}) => {
  const selected = items.filter(item => selectedItems.some(i => i.line_item_id === item.id));

  const subtotal = selected.reduce((acc, item) => {
    return acc + item.subtotal;
  }, 0);

  const selectedShippingMethod = shippingMethods?.find(m => m.id === returnMethod);
  const returnCost = selectedShippingMethod?.amount;
  const totalRefund = subtotal - (returnCost ?? 0);

  return (
    <div>
      {selected.length ? (
        <Card className="p-4">
          <ul className="flex flex-col gap-4">
            {selected.map(item => (
              <li
                key={item.id}
                className="flex w-full items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-sm">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.subtitle ?? ''}
                        width={56}
                        height={80}
                        className="h-full w-full rounded-sm object-cover"
                      />
                    ) : (
                      <Image
                        src={'/images/placeholder.svg'}
                        alt={item.subtitle ?? ''}
                        width={56}
                        height={80}
                        className="h-full w-full scale-75 opacity-25"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="heading-xs text-primary">{item.title}</span>
                    {item.subtitle && (
                      <span className="label-sm text-secondary">{item.subtitle}</span>
                    )}
                  </div>
                </div>
                <div className="heading-sm whitespace-nowrap text-primary">
                  {convertToLocale({ amount: item.subtotal, currency_code })}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex w-full flex-col gap-0.5">
          <p className="label-md flex justify-between">
            <span className="text-secondary">Subtotal refund:</span>
            <span className="label-md text-primary">
              {convertToLocale({
                amount: subtotal,
                currency_code
              })}
            </span>
          </p>
          {tab === 1 && (
            <p className="label-md flex justify-between">
              <span className="text-secondary">Return cost:</span>
              <span className="label-md text-primary">
                {convertToLocale({
                  amount: returnCost ?? 0,
                  currency_code
                })}
              </span>
            </p>
          )}
        </div>

        {tab === 1 && <hr />}

        {tab === 1 && (
          <p className="label-md flex justify-between">
            <span className="text-secondary">Total refund:</span>
            <span className="label-xl text-primary">
              {convertToLocale({
                amount: totalRefund,
                currency_code
              })}
            </span>
          </p>
        )}

        <Button
          className="label-md w-full uppercase"
          disabled={(tab === 0 && !selected.length) || (tab === 1 && !returnMethod)}
          onClick={tab === 0 ? () => handleTabChange(1) : () => handleSubmit()}
        >
          {tab === 0
            ? selected.length
              ? 'Continue'
              : 'Select Items'
            : !returnMethod
              ? 'Select return method'
              : 'Request return'}
        </Button>

        {tab === 1 && (
          <p className="text-center text-sm text-secondary">
            By clicking the Request return button, you confirm that you have read, understand and
            accept our Terms of Use, Terms of Sale and Returns Policy.
          </p>
        )}
      </Card>
    </div>
  );
};
