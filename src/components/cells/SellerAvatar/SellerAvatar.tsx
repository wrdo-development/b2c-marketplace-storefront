import Image from 'next/image';

import { cn } from '@/lib/utils';

export const SellerAvatar = ({
  photo = '',
  size = 32,
  alt = '',
  className = ''
}: {
  photo?: string;
  size?: number;
  alt?: string;
  className?: string;
}) => {
  return photo ? (
    <Image
      src={decodeURIComponent(photo)}
      alt={alt}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      style={{ maxWidth: size, maxHeight: size }}
    />
  ) : (
    <Image
      src="/images/placeholder.svg"
      alt={alt}
      className={cn('h-8 w-8 shrink-0 opacity-30', className)}
      width={32}
      height={32}
      style={{ maxWidth: 32, maxHeight: 32 }}
    />
  );
};
