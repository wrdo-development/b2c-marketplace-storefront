import { convertToLocale } from '@/lib/helpers/money';

export const CartItemsFooter = ({
  currency_code,
  price
}: {
  currency_code: string;
  price: number;
}) => {
  return (
    <div className="label-md flex items-center justify-between rounded-sm border p-4">
      <p className="text-secondary">Estimated delivery:</p>
      <p className="text-primary">
        {convertToLocale({
          amount: price,
          currency_code
        })}
      </p>
    </div>
  );
};
