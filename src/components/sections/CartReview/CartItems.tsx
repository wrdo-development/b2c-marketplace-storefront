import { HttpTypes } from '@medusajs/types';

import { CartItemsHeader, CartItemsProducts } from '@/components/cells';
import { groupItemsBySeller } from '@/lib/helpers/group-cart-items-by-seller';

export const CartItems = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  if (!cart) return null;

  const groupedItems = groupItemsBySeller(cart);

  return Object.keys(groupedItems).map((key, index) => (
    <div
      key={key}
      className="mb-4"
    >
      <CartItemsHeader
        seller={groupedItems[key]?.seller}
        parcelNumber={index + 1}
        variant="checkout"
      />
      <div className="flex flex-col gap-4 rounded-b-sm border border-t-0 p-4">
        <CartItemsProducts
          delete_item={false}
          change_quantity={false}
          compact={true}
          products={groupedItems[key].items || []}
          currency_code={cart.currency_code}
        />
      </div>
    </div>
  ));
};
