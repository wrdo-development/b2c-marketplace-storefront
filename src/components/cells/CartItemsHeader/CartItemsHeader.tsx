import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { SingleProductSeller } from '@/types/product';

import { SellerAvatar } from '../SellerAvatar/SellerAvatar';

export const CartItemsHeader = ({
  seller,
  parcelNumber
}: {
  seller: SingleProductSeller;
  parcelNumber: number;
}) => {
  return (
    <LocalizedClientLink href={`/sellers/${seller.handle}`}>
      <div className="flex items-center justify-between rounded-sm border p-4">
        <div className="flex items-center gap-1">
          <p className="label-md text-primary">Parcel #{parcelNumber} delivered by</p>
          <p className="heading-xs uppercase text-primary">{seller.name}</p>
        </div>
        <SellerAvatar
          photo={seller.photo}
          size={32}
          alt={seller.name}
        />
      </div>
    </LocalizedClientLink>
  );
};
