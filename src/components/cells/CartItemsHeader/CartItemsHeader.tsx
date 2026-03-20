import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { SingleProductSeller } from '@/types/product';

import { SellerAvatar } from '../SellerAvatar/SellerAvatar';

export const CartItemsHeader = ({
  seller,
  parcelNumber,
  variant = 'default'
}: {
  seller: SingleProductSeller;
  parcelNumber: number;
  variant?: 'default' | 'checkout';
}) => {
  if (variant === 'checkout') {
    return (
      <div className="flex h-[54px] items-center justify-between rounded-sm border bg-component-secondary p-4">
        <div className="flex items-center gap-1">
          <span className="label-md text-secondary">Seller:</span>
          <span className="label-md text-primary">{seller.name}</span>
        </div>
        <span className="label-md text-secondary">Parcel {parcelNumber}</span>
      </div>
    );
  }

  return (
    <LocalizedClientLink href={`/sellers/${seller.handle}`}>
      <div className="flex items-center justify-between rounded-sm border p-4">
        <div className="flex items-center gap-4">
          <SellerAvatar
            photo={seller.photo}
            size={32}
            alt={seller.name}
            className="lg:hidden"
          />
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1">
            <p className="label-md text-primary">Parcel #{parcelNumber} delivered by</p>
            <p className="heading-xs uppercase text-primary">{seller.name}</p>
          </div>
        </div>
        <SellerAvatar
          photo={seller.photo}
          size={32}
          alt={seller.name}
          className="hidden lg:block"
        />
      </div>
    </LocalizedClientLink>
  );
};
