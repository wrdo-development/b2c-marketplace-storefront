import { HttpTypes } from '@medusajs/types';

import {
  CartItem,
  ShippingOption
} from '@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection';

import { FLEEK_KEY } from './group-cart-items-by-seller';

export function isDeliveryComplete(
  cart: HttpTypes.StoreCart,
  availableShippingMethods: ShippingOption[] | null
): boolean {
  if (!cart.shipping_methods?.length) return false;
  if (!availableShippingMethods?.length) return false;

  const shippingOptions = availableShippingMethods.filter(
    sm => sm.rules?.find(rule => rule.attribute === 'is_return')?.value !== 'true'
  );

  const groupedBySeller = shippingOptions.reduce<Record<string, ShippingOption[]>>(
    (acc, method) => {
      const sellerId = method.is_admin_option ? FLEEK_KEY : method.seller_id;
      if (!sellerId) return acc;
      if (!acc[sellerId]) acc[sellerId] = [];
      acc[sellerId]!.push(method);
      return acc;
    },
    {}
  );

  const items = (cart.items ?? []) as CartItem[];

  const hasAdminItems = items.some(
    item => item.variant_managed_by === 'admin' || !item.product?.seller
  );

  const sellerIds = Object.keys(groupedBySeller).filter(sellerId => {
    if (sellerId === FLEEK_KEY) return hasAdminItems;
    return items.some(
      item => item.product?.seller?.id === sellerId && item.variant_managed_by !== 'admin'
    );
  });

  if (sellerIds.length === 0) return false;

  return sellerIds.every(sellerId => {
    const options = groupedBySeller[sellerId] ?? [];
    return cart.shipping_methods!.some(sm => options.some(opt => opt.id === sm.shipping_option_id));
  });
}
