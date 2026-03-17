'use client';

import { useRef, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { useToggleState } from '@medusajs/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button, Divider } from '@/components/atoms';
import ErrorMessage from '@/components/molecules/ErrorMessage/ErrorMessage';
import ShippingAddress, {
  ShippingAddressHandle
} from '@/components/organisms/ShippingAddress/ShippingAddress';
import { TickThinIcon } from '@/icons';
import Spinner from '@/icons/spinner';
import { setAddresses } from '@/lib/data/cart';
import compareAddresses from '@/lib/helpers/compare-addresses';
import isAddressComplete from '@/lib/helpers/is-address-complete';

export const CartAddressSection = ({
  cart,
  customer
}: {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAddress = isAddressComplete(cart?.shipping_address);

  const isEditMode = isAddress && searchParams.get('step') === 'address';
  const isOpen = !isAddress || searchParams.get('step') === 'address';

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    !cart?.billing_address || compareAddresses(cart.shipping_address, cart.billing_address)
  );

  const shippingRef = useRef<ShippingAddressHandle>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!shippingRef.current?.validate()) return;
    const data = shippingRef.current.getAddressData();
    setIsPending(true);
    const result = await setAddresses(data);
    setIsPending(false);
    if (result) {
      setError(result);
      return;
    }
    if (isEditMode) {
      router.replace(pathname);
      router.refresh();
    } else {
      router.replace(`${pathname}?step=delivery`);
      router.refresh();
    }
  };

  const handleEdit = () => {
    router.replace(pathname + '?step=address');
  };

  return (
    <div
      className="overflow-hidden rounded-sm border"
      data-testid="checkout-step-address"
    >
      <div className="flex items-center justify-between bg-component-secondary p-4">
        <div className="flex items-center gap-2">
          {!isOpen && isAddress ? (
            <span className="flex w-10 shrink-0 justify-center">
              <TickThinIcon size={24} />
            </span>
          ) : (
            <span className="heading-md w-10 shrink-0 text-center text-primary">1</span>
          )}
          <span className="heading-md uppercase text-primary">SHIPPING ADDRESS</span>
        </div>
        {!isOpen && isAddress && (
          <Button
            onClick={handleEdit}
            variant="tonal"
            data-testid="checkout-address-edit-button"
          >
            EDIT
          </Button>
        )}
      </div>
      <form
        noValidate
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {isOpen ? (
          <div className="border-t border-primary">
            <div className="p-4">
              <ShippingAddress
                ref={shippingRef}
                customer={customer}
                checked={sameAsBilling}
                onChange={toggleSameAsBilling}
                cart={cart}
              />
            </div>
            <Divider />
            <div className="p-4">
              <Button
                className="w-full"
                data-testid="submit-address-button"
                variant="filled"
                disabled={isPending}
                loading={isPending}
              >
                {isEditMode ? 'SAVE' : 'PROCEED TO DELIVERY'}
              </Button>
              <ErrorMessage
                error={error}
                data-testid="address-error-message"
              />
            </div>
          </div>
        ) : (
          <div className="border-t border-primary">
            {cart && cart.shipping_address ? (
              <div className="p-2">
                <div className="rounded-sm p-3">
                  <p className="label-md text-primary">Shipping address</p>
                  <p className="label-md whitespace-pre-wrap text-secondary">
                    {`${cart.shipping_address.first_name} ${cart.shipping_address.last_name}\n${cart.shipping_address.address_1}${cart.shipping_address.address_2 ? ` ${cart.shipping_address.address_2}` : ''}\n${cart.shipping_address.postal_code} ${cart.shipping_address.city}, ${cart.shipping_address.country_code?.toUpperCase()}`}
                  </p>
                  <p className="label-md text-secondary">
                    {cart.email}, {cart.shipping_address.phone}
                  </p>
                </div>
                <div className="rounded-sm p-3">
                  <p className="label-md text-primary">Billing address</p>
                  <p className="label-md text-secondary">
                    {!cart.billing_address ||
                    compareAddresses(cart.shipping_address, cart.billing_address)
                      ? 'Same as shipping address'
                      : cart.billing_address?.first_name
                        ? `${cart.billing_address.first_name} ${cart.billing_address.last_name}, ${cart.billing_address.address_1}, ${cart.billing_address.postal_code} ${cart.billing_address.city}, ${cart.billing_address.country_code?.toUpperCase()}`
                        : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
