import { OrderProductListItem } from '@/components/cells';

export const OrderParcelItems = ({
  items,
  currency_code,
  isCanceled
}: {
  items: any[];
  currency_code: string;
  isCanceled?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-[16px]">
      {items.map(item => (
        <OrderProductListItem
          key={item.id + item.variant_id}
          item={item}
          currency_code={currency_code}
          isCanceled={isCanceled}
        />
      ))}
    </div>
  );
};
