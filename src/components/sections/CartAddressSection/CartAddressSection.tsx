'use client';

import { useEffect, useRef, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { useToggleState } from '@medusajs/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button, Divider } from '@/components/atoms';
import ErrorMessage from '@/components/molecules/ErrorMessage/ErrorMessage';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import ShippingAddress, {
  ShippingAddressHandle
} from '@/components/organisms/ShippingAddress/ShippingAddress';
import { TickThinIcon } from '@/icons';
import Spinner from '@/icons/spinner';
import { setAddresses } from '@/lib/data/cart';
import compareAddresses from '@/lib/helpers/compare-addresses';

const isAddressPopulated = address => {
  if (!address || typeof address !== 'object') return false;

  const requiredFields = ['first_name', 'last_name', 'address_1', 'city'];

  return requiredFields.some(field => address[field] !== null && address[field]?.trim() !== '');
};

export const CartAddressSection = ({
  cart,
  customer
}: {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isAddress = Boolean(
    cart?.shipping_address &&
    cart?.shipping_address.first_name &&
    cart?.shipping_address.last_name &&
    cart?.shipping_address.address_1 &&
    cart?.shipping_address.city &&
    cart?.shipping_address.postal_code &&
    cart?.shipping_address.country_code
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const isOpen = !isAddress || isEditOpen;

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
    if (isEditOpen) {
      setIsEditOpen(false);
      router.refresh();
    } else {
      router.replace(`${pathname}?step=delivery`);
      router.refresh();
    }
  };

  useEffect(() => {
    if (!isAddress) {
      router.replace(pathname + '?step=address');
    }
  }, [isAddress]);

  const handleEdit = () => {
    setIsEditOpen(true);
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
              >
                {isEditOpen ? 'SAVE' : 'PROCEED TO DELIVERY'}
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
                      : isAddressPopulated(cart.billing_address)
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
        {isAddress && !searchParams.get('step') && (
          <div className="border-t border-primary p-4">
            <LocalizedClientLink href="/checkout?step=delivery">
              <Button
                variant="filled"
                className="w-full"
              >
                Continue to Delivery
              </Button>
            </LocalizedClientLink>
          </div>
        )}
      </form>
    </div>
  );
};
