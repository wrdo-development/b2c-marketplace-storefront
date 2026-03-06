import { HttpTypes } from '@medusajs/types';

import { CartItemsFooter, CartItemsHeader, CartItemsProducts } from '@/components/cells';
import { groupItemsBySeller } from '@/lib/helpers/group-cart-items-by-seller';
import { Wishlist } from '@/types/wishlist';

import { EmptyCart } from './EmptyCart';

export const CartItems = ({
  cart,
  user,
  wishlist
}: {
  cart: HttpTypes.StoreCart | null;
  user?: HttpTypes.StoreCustomer | null;
  wishlist?: Wishlist;
}) => {
  if (!cart) return null;

  const groupedItems = groupItemsBySeller(cart);

  if (!Object.keys(groupedItems).length) return <EmptyCart />;

  return Object.keys(groupedItems).map((key, index) => (
    <div
      key={key}
      className="mb-10"
      data-testid={`cart-items-seller-${key}`}
    >
      <CartItemsHeader
        seller={groupedItems[key]?.seller}
        parcelNumber={index + 1}
      />
      <CartItemsProducts
        products={groupedItems[key].items || []}
        currency_code={cart.currency_code}
        user={user}
        wishlist={wishlist}
      />
      <CartItemsFooter
        currency_code={cart.currency_code}
        price={cart.shipping_subtotal}
      />
    </div>
  ));
};
