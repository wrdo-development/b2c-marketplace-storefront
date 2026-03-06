import { HttpTypes } from '@medusajs/types';
import Image from 'next/image';

import { WishlistButton } from '@/components/cells/WishlistButton/WishlistButton';
import { DeleteCartItemButton } from '@/components/molecules';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { UpdateCartItemButton } from '@/components/molecules/UpdateCartItemButton/UpdateCartItemButton';
import { filterValidCartItems } from '@/lib/helpers/filter-valid-cart-items';
import { convertToLocale } from '@/lib/helpers/money';
import { Wishlist } from '@/types/wishlist';

export const CartItemsProducts = ({
  products,
  currency_code,
  delete_item = true,
  change_quantity = true,
  user,
  wishlist
}: {
  products: HttpTypes.StoreCartLineItem[];
  currency_code: string;
  delete_item?: boolean;
  change_quantity?: boolean;
  user?: HttpTypes.StoreCustomer | null;
  wishlist?: Wishlist;
}) => {
  const validProducts = filterValidCartItems(products);

  return (
    <div>
      {validProducts.map(product => {
        const { options } = product.variant ?? {};
        const vendor = product.product?.vendor ?? product.variant?.product?.vendor;

        const total = convertToLocale({
          amount: product.total ?? 0,
          currency_code
        });

        const originalTotal = product.original_total ?? 0;
        const hasDiscount = (product.discount_total ?? 0) > 0;

        const originalPrice = convertToLocale({
          amount: originalTotal,
          currency_code
        });

        return (
          <div
            key={product.id}
            data-testid={`cart-item-${product.id}`}
            className="flex gap-2 rounded-sm border p-1"
          >
            <LocalizedClientLink href={`/products/${product.product_handle}`}>
              <div
                className="flex h-[132px] w-[100px] shrink-0 items-center justify-center"
                data-testid="cart-item-image"
              >
                {product.thumbnail ? (
                  <Image
                    src={decodeURIComponent(product.thumbnail)}
                    alt="Product thumbnail"
                    width={100}
                    height={132}
                    className="h-[132px] w-[100px] rounded-[6px] object-cover"
                  />
                ) : (
                  <Image
                    src={'/images/placeholder.svg'}
                    alt="Product thumbnail"
                    width={50}
                    height={66}
                    className="h-[66px] w-[50px] rounded-[6px] object-cover opacity-30"
                  />
                )}
              </div>
            </LocalizedClientLink>

            <div className="min-w-0 flex-1 p-4">
              <LocalizedClientLink href={`/products/${product.product_handle}`}>
                <div className="mb-4">
                  {vendor && <p className="label-md text-secondary">{vendor}</p>}
                  <h3
                    className="heading-xs truncate text-primary"
                    data-testid="cart-item-title"
                  >
                    {product.product_title}
                  </h3>
                </div>
              </LocalizedClientLink>
              <div
                className="label-md text-secondary"
                data-testid="cart-item-details"
              >
                {options?.map(({ option, id, value }) => (
                  <p key={id}>
                    {option?.title}: <span className="text-primary">{value}</span>
                  </p>
                ))}
              </div>
            </div>

            {change_quantity && (
              <div className="flex shrink-0 items-center justify-center px-4">
                <UpdateCartItemButton
                  quantity={product.quantity}
                  lineItemId={product.id}
                />
              </div>
            )}

            {!change_quantity && (
              <div className="flex shrink-0 items-center justify-center px-4">
                <p className="label-md text-secondary">
                  Quantity: <span className="text-primary">{product.quantity}</span>
                </p>
              </div>
            )}

            <div className="flex shrink-0 flex-col items-end justify-between p-2">
              <div className="flex items-start gap-1">
                <WishlistButton
                  productId={product.product_id!}
                  wishlist={wishlist}
                  user={user}
                  variant="text"
                />
                {delete_item && <DeleteCartItemButton id={product.id} />}
              </div>
              <div
                className="text-right"
                data-testid="cart-item-price"
              >
                {hasDiscount && (
                  <p className="label-md text-secondary line-through">{originalPrice}</p>
                )}
                <p className="label-lg text-primary">{total}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
