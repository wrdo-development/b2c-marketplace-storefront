'use client';

import { useEffect, useRef, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { usePathname } from 'next/navigation';

import { Badge, Button } from '@/components/atoms';
import { SellerAvatar } from '@/components/cells/SellerAvatar/SellerAvatar';
import { CartDropdownItem, Dropdown } from '@/components/molecules';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { useCartContext } from '@/components/providers';
import { usePrevious } from '@/hooks/usePrevious';
import { CartIcon } from '@/icons';
import { filterValidCartItems } from '@/lib/helpers/filter-valid-cart-items';
import { groupItemsBySeller } from '@/lib/helpers/group-cart-items-by-seller';
import { convertToLocale } from '@/lib/helpers/money';

const getItemCount = (cart: HttpTypes.StoreCart | null) => {
  return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
};

export const CartDropdown = () => {
  const { cart } = useCartContext();
  const [open, setOpen] = useState(false);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const previousItemCount = usePrevious(getItemCount(cart));
  const cartItemsCount = (cart && getItemCount(cart)) || 0;
  const pathname = usePathname();

  const groupedItems = cart ? groupItemsBySeller(cart) : {};

  const total = convertToLocale({
    amount: cart?.total || 0,
    currency_code: cart?.currency_code || 'eur'
  });

  const delivery = convertToLocale({
    amount: cart?.shipping_subtotal || 0,
    currency_code: cart?.currency_code || 'eur'
  });

  const openWithAutoClose = () => {
    setOpen(true);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = setTimeout(() => setOpen(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      previousItemCount !== undefined &&
      cartItemsCount > previousItemCount &&
      pathname.split('/')[2] !== 'cart'
    ) {
      openWithAutoClose();
    }
  }, [cartItemsCount, previousItemCount]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <LocalizedClientLink
        href="/cart"
        className="relative"
        aria-label="Go to cart"
      >
        <CartIcon size={20} />
        {Boolean(cartItemsCount) && (
          <Badge className="absolute -right-2 -top-2 h-4 w-4 p-0">{cartItemsCount}</Badge>
        )}
      </LocalizedClientLink>
      <Dropdown show={open}>
        <div className="shadow-lg lg:w-[408px]">
          <h3 className="heading-md border-b p-4 uppercase">Shopping cart</h3>
          <div>
            {Boolean(cartItemsCount) ? (
              <div>
                <div className="no-scrollbar flex max-h-[360px] flex-col overflow-y-auto px-4 pt-4">
                  {Object.entries(groupedItems).map(([key, group], index) => {
                    const validItems = filterValidCartItems(group.items);
                    if (!validItems.length) return null;
                    return (
                      <div
                        key={key}
                        className={index > 0 ? '-mt-px' : ''}
                      >
                        <div className="flex items-center gap-4 rounded-sm border p-3">
                          <SellerAvatar
                            photo={group.seller?.photo}
                            size={32}
                            alt={group.seller?.name}
                          />
                          <div className="flex flex-col leading-none">
                            <span className="label-md text-primary">
                              Parcel #{index + 1} delivered by
                            </span>
                            <span className="heading-xs uppercase text-primary">
                              {group.seller?.name}
                            </span>
                          </div>
                        </div>
                        {validItems.map(item => (
                          <div
                            key={`${item.product_id}-${item.variant_id}`}
                            className="-mt-px"
                          >
                            <CartDropdownItem
                              item={item}
                              currency_code={cart?.currency_code || 'eur'}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t p-4">
                  <div className="label-md flex items-center justify-between text-secondary">
                    Delivery: <span className="text-primary">{delivery}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="label-md text-secondary">Total:</span>
                    <span className="label-xl text-primary">{total}</span>
                  </div>
                  <LocalizedClientLink href="/cart">
                    <Button className="mt-4 w-full py-3 uppercase">Go to cart</Button>
                  </LocalizedClientLink>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-4">
                  <p className="text-base font-light text-secondary">
                    Your shopping cart is currently empty.
                  </p>
                </div>
                <div className="border-t p-4">
                  <LocalizedClientLink href="/categories">
                    <Button className="h-12 w-full uppercase">Explore Products</Button>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  );
};
