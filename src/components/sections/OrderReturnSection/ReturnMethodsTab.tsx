import { HttpTypes } from '@medusajs/types';

import { Card, Checkbox } from '@/components/atoms';
import { convertToLocale } from '@/lib/helpers/money';

export const ReturnMethodsTab = ({
  shippingMethods,
  handleSetReturnMethod,
  returnMethod,
  currency_code
}: {
  shippingMethods: HttpTypes.StoreShippingOption[];
  handleSetReturnMethod: (methodId: string) => void;
  returnMethod: string;
  currency_code: string;
}) => {
  const noShippingMethods = !shippingMethods?.length || false;

  return (
    <div className="mb-8">
      <Card className="bg-secondary p-4">
        <p className="heading-sm uppercase text-primary">Return method</p>
      </Card>
      <Card className="p-2">
        {noShippingMethods ? (
          <div className="heading-md w-full py-4 text-center font-bold">
            No shipping methods available
          </div>
        ) : (
          <ul className="w-full">
            {shippingMethods.map(method => (
              <li
                key={method.id}
                onClick={() => handleSetReturnMethod(method.id)}
                className="flex cursor-pointer items-center gap-2 rounded-lg py-2 pl-1 pr-3"
              >
                <Checkbox checked={returnMethod === method.id} />
                <div className="flex-1">
                  <span className="label-md text-primary">{method.name}</span>
                </div>
                {method.amount != null && (
                  <span className="label-md text-primary">
                    {convertToLocale({
                      amount: method.amount,
                      currency_code
                    })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
