'use client';

import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CartEmpty, CartItems, CartSummary } from '@/components/organisms';
import { useCartContext } from '@/components/providers';
import { retrieveCustomer } from '@/lib/data/customer';
import { Wishlist } from '@/types/wishlist';

type Customer = Awaited<ReturnType<typeof retrieveCustomer>>;

export const Cart = ({ user, wishlist }: { user?: Customer; wishlist?: Wishlist }) => {
  const { cart } = useCartContext();

  if (!cart || !cart.items?.length) {
    return <CartEmpty />;
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-6">
        <CartItems
          cart={cart}
          user={user}
          wishlist={wishlist}
        />
      </div>
      <div className="lg:col-span-2"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="h-fit rounded-sm border p-4">
          <CartSummary
            item_total={cart?.item_subtotal || 0}
            shipping_total={cart?.shipping_subtotal || 0}
            total={cart?.total || 0}
            currency_code={cart?.currency_code || ''}
            tax={cart?.tax_total || 0}
            discount_total={cart?.discount_subtotal || 0}
          />
          <LocalizedClientLink href="/checkout?step=address">
            <Button className="mt-4 flex w-full items-center justify-center py-3 font-normal uppercase">
              Proceed to checkout
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </>
  );
};
