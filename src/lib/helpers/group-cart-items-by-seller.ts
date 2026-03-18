import { HttpTypes } from '@medusajs/types';

export const FLEEK_KEY = 'fleek';
export const FLEEK_NAME = 'FLEEK';

export type GroupedCartBySeller = Record<
  string,
  { seller: any; items: HttpTypes.StoreCartLineItem[] }
>;

export function groupItemsBySeller(cart: HttpTypes.StoreCart): GroupedCartBySeller {
  const groupedBySeller: GroupedCartBySeller = {};

  const getOrCreateFleekSection = () => {
    if (!groupedBySeller[FLEEK_KEY]) {
      groupedBySeller[FLEEK_KEY] = {
        seller: {
          name: FLEEK_NAME,
          id: FLEEK_KEY,
          photo: '/Logo.svg',
          created_at: new Date()
        },
        items: []
      };
    }
    return groupedBySeller[FLEEK_KEY];
  };

  cart.items?.forEach((item: any) => {
    const isAdminManaged = item.variant_managed_by === 'admin';
    const seller = item.product?.seller;

    if (isAdminManaged) {
      getOrCreateFleekSection().items.push(item);
      return;
    }

    if (seller) {
      if (!groupedBySeller[seller.id]) {
        groupedBySeller[seller.id] = {
          seller: seller,
          items: []
        };
      }
      groupedBySeller[seller.id].items.push(item);
    } else {
      getOrCreateFleekSection().items.push(item);
    }
  });

  return groupedBySeller;
}
