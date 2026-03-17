'use client';

import { useEffect, useMemo, useState, useTransition, type FC } from 'react';

import type { HttpTypes } from '@medusajs/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button, Divider, Radio } from '@/components/atoms';
import { TickThinIcon } from '@/icons';
import { removeShippingMethod, setShippingMethod } from '@/lib/data/cart';
import { calculatePriceForShippingOption } from '@/lib/data/fulfillment';
import { FLEEK_KEY, FLEEK_NAME } from '@/lib/helpers/group-cart-items-by-seller';
import { convertToLocale } from '@/lib/helpers/money';

type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  seller?: {
    id: string;
    name: string;
  };
};

type CartItem = HttpTypes.StoreCartLineItem & {
  product?: ExtendedStoreProduct;
};

export type StoreCardShippingMethod = HttpTypes.StoreCartShippingOption & {
  seller_id?: string;
  seller_name?: string;
  service_zone?: {
    fulfillment_set: {
      type: string;
    };
  };
};

type ShippingOption = StoreCardShippingMethod & {
  rules: any;
  seller_id: string | null;
  seller_name?: string;
  is_admin_option?: boolean;
  price_type: string;
  id: string;
  amount?: number;
};

type ShippingProps = {
  cart: Omit<HttpTypes.StoreCart, 'items'> & {
    items?: CartItem[];
  };
  availableShippingMethods: ShippingOption[] | null;
};

const CartShippingMethodsSection: FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [selectedMethodsBySeller, setSelectedMethodsBySeller] = useState<Record<string, string>>(
    {}
  );
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get('step') === 'delivery';
  const [isEditOpen, setIsEditOpen] = useState(false);

  const shippingOptions = useMemo(
    () =>
      availableShippingMethods?.filter(
        sm => sm.rules?.find((rule: any) => rule.attribute === 'is_return')?.value !== 'true'
      ),
    [availableShippingMethods]
  );

  const groupedBySeller = useMemo(
    () =>
      (shippingOptions ?? []).reduce<Record<string, ShippingOption[]>>((acc, method) => {
        const sellerId = method.is_admin_option ? FLEEK_KEY : method.seller_id;
        if (!sellerId) return acc;
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId]!.push(method);
        return acc;
      }, {}),
    [shippingOptions]
  );

  const hasAdminItems = useMemo(
    () =>
      (cart.items ?? []).some(
        (item: any) => item.variant_managed_by === 'admin' || !item.product?.seller
      ),
    [cart.items]
  );

  const sellerIds = useMemo(
    () =>
      Object.keys(groupedBySeller).filter(sellerId => {
        if (sellerId === FLEEK_KEY) return hasAdminItems;
        return true;
      }),
    [groupedBySeller, hasAdminItems]
  );

  // Pre-fill selections from cart's existing shipping methods
  useEffect(() => {
    if (!cart.shipping_methods?.length) {
      setSelectedMethodsBySeller({});
      return;
    }
    const preSelected: Record<string, string> = {};
    for (const sellerId of sellerIds) {
      const options = groupedBySeller[sellerId] ?? [];
      const match = cart.shipping_methods.find(sm =>
        options.some(opt => opt.id === sm.shipping_option_id)
      );
      if (match?.shipping_option_id) {
        preSelected[sellerId] = match.shipping_option_id;
      }
    }
    if (Object.keys(preSelected).length > 0) {
      setSelectedMethodsBySeller(preSelected);
    }
  }, [cart.shipping_methods, sellerIds, groupedBySeller]);

  // Calculate prices for "calculated" type options
  useEffect(() => {
    const calculatedOptions = (shippingOptions ?? []).filter(sm => sm.price_type === 'calculated');
    if (!calculatedOptions.length) return;

    setIsLoadingPrices(true);
    Promise.allSettled(
      calculatedOptions.map(sm => calculatePriceForShippingOption(sm.id, cart.id))
    ).then(results => {
      const map: Record<string, number> = {};
      results
        .filter(r => r.status === 'fulfilled')
        .forEach(r => {
          if (r.value?.id) map[r.value.id] = r.value.amount!;
        });
      setCalculatedPricesMap(map);
      setIsLoadingPrices(false);
    });
  }, [availableShippingMethods, cart.id]);

  const hasShipping = (cart.shipping_methods?.length ?? 0) > 0;

  useEffect(() => {
    setError(null);
    setShowValidation(false);
  }, [isOpen]);

  const getOptionPrice = (option: ShippingOption): string | null => {
    const amount = option.price_type === 'flat' ? option.amount : calculatedPricesMap[option.id];
    if (amount == null) return null;
    return convertToLocale({ amount, currency_code: cart.currency_code });
  };

  const getItemsForSeller = (sellerId: string): CartItem[] => {
    if (sellerId === FLEEK_KEY) {
      return (cart.items ?? []).filter(
        (item: any) => item.variant_managed_by === 'admin' || !item.product?.seller
      );
    }
    return (cart.items ?? []).filter(item => item.product?.seller?.id === sellerId);
  };

  const handleSelectMethod = (sellerId: string, optionId: string) => {
    setSelectedMethodsBySeller(prev => ({ ...prev, [sellerId]: optionId }));
    setShowValidation(false);
  };

  const handleSubmit = () => {
    const allSelected = sellerIds.every(id => selectedMethodsBySeller[id]);
    if (!allSelected) {
      setShowValidation(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        for (const sellerId of sellerIds) {
          const optionId = selectedMethodsBySeller[sellerId]!;
          const res = await setShippingMethod({ cartId: cart.id, shippingMethodId: optionId });
          if (!res.ok) {
            setError(res.error?.message ?? 'An error occurred');
            return;
          }
        }
        if (isEditOpen) {
          setIsEditOpen(false);
          router.replace(pathname);
        } else {
          router.push(pathname + '?step=payment', { scroll: false });
        }
        router.refresh();
      } catch (err: any) {
        setError(
          err?.message?.replace('Error setting up the request: ', '') ?? 'An error occurred'
        );
      }
    });
  };

  const handleEdit = () => {
    startTransition(async () => {
      if (cart.shipping_methods?.length) {
        await Promise.all(cart.shipping_methods.map(sm => removeShippingMethod(sm.id)));
      }
      setIsEditOpen(true);
      router.replace(pathname + '?step=delivery');
      router.refresh();
    });
  };

  const isDeliveryCompleted = !isOpen && hasShipping;

  return (
    <div
      className="overflow-hidden rounded-sm border"
      data-testid="checkout-step-delivery"
    >
      {/* Section heading */}
      <div className="flex items-center justify-between bg-component-secondary p-4">
        <div className="flex items-center gap-2">
          {isDeliveryCompleted ? (
            <span className="flex w-10 shrink-0 justify-center">
              <TickThinIcon size={24} />
            </span>
          ) : (
            <span className="heading-md w-10 shrink-0 text-center text-primary">2</span>
          )}
          <span className="heading-md uppercase text-primary">DELIVERY</span>
        </div>
        {isDeliveryCompleted && !isOpen && (
          <Button
            onClick={handleEdit}
            variant="tonal"
          >
            EDIT
          </Button>
        )}
      </div>

      {isOpen ? (
        /* Editing state */
        <div className="border-t border-primary">
          {sellerIds.length === 0 ? (
            <p className="label-md p-4 text-secondary">No shipping options available</p>
          ) : (
            <>
              {sellerIds.map((sellerId, parcelIndex) => {
                const options = groupedBySeller[sellerId] ?? [];
                const sellerName =
                  options[0]?.seller_name ?? (sellerId === FLEEK_KEY ? FLEEK_NAME : '');
                const items = getItemsForSeller(sellerId);
                const selectedOptionId = selectedMethodsBySeller[sellerId];
                const hasError = showValidation && !selectedOptionId;

                return (
                  <div key={sellerId}>
                    {parcelIndex > 0 && <Divider />}
                    <div className="p-2">
                      {/* Parcel heading row */}
                      <div className="flex items-start gap-20 p-3">
                        <span className="heading-sm min-w-0 flex-1 text-primary">
                          Parcel {parcelIndex + 1}
                        </span>
                        {items.length > 0 && (
                          <div className="flex shrink-0 gap-2">
                            {items.map(
                              item =>
                                item.thumbnail && (
                                  <div
                                    key={item.id}
                                    className="relative size-14 shrink-0 overflow-hidden rounded-sm border"
                                  >
                                    <img
                                      src={item.thumbnail}
                                      alt={item.title ?? ''}
                                      className="size-full object-cover"
                                    />
                                  </div>
                                )
                            )}
                          </div>
                        )}
                        {sellerName && (
                          <div className="label-md flex w-[200px] shrink-0 items-center justify-end gap-1">
                            <span className="text-secondary">Seller:</span>
                            <span className="text-primary">{sellerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping options */}
                      <div>
                        {options.map(option => {
                          const price = getOptionPrice(option);
                          const isSelected = selectedOptionId === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className="flex w-full items-center gap-2 overflow-hidden rounded-sm py-2 pl-1 pr-3 hover:bg-component-secondary"
                              onClick={() => handleSelectMethod(sellerId, option.id)}
                            >
                              <Radio
                                selected={isSelected}
                                hasError={hasError}
                              />
                              <span className="label-md flex-1 text-left text-primary">
                                {option.name}
                              </span>
                              <span className="label-md shrink-0 text-right text-primary">
                                {price ?? (isLoadingPrices ? '...' : '-')}
                              </span>
                            </button>
                          );
                        })}
                        {hasError && (
                          <p className="label-sm px-3 pb-1 text-negative">
                            Please select delivery method
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <Divider />
              <div className="p-4">
                {error && <p className="label-sm mb-2 text-negative">{error}</p>}
                <Button
                  className="w-full"
                  variant="filled"
                  onClick={handleSubmit}
                  disabled={isPending || isLoadingPrices}
                  loading={isPending}
                  data-testid="submit-delivery-button"
                >
                  {isEditOpen ? 'SAVE' : 'PROCEED TO PAYMENT'}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Collapsed / summary state */
        isDeliveryCompleted && (
          <div className="border-t border-primary">
            {(cart.shipping_methods ?? []).map((cartMethod, parcelIndex) => {
              const matchedOption = (shippingOptions ?? []).find(
                opt => opt.id === cartMethod.shipping_option_id
              );
              const sellerName = matchedOption?.seller_name;

              return (
                <div key={cartMethod.id}>
                  {parcelIndex > 0 && <Divider />}
                  <div className="p-2">
                    <div className="flex items-start justify-between p-3">
                      <span className="heading-sm text-primary">Parcel {parcelIndex + 1}</span>
                      {sellerName && (
                        <div className="label-md flex items-center gap-1">
                          <span className="text-secondary">Seller:</span>
                          <span className="text-primary">{sellerName}</span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-sm p-3">
                      <p className="label-md text-primary">Delivery method</p>
                      <p className="label-md text-secondary">
                        {cartMethod.name}
                        {cartMethod.amount != null &&
                          `, ${convertToLocale({ amount: cartMethod.amount, currency_code: cart.currency_code })}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default CartShippingMethodsSection;
