import { Fragment } from 'react';

import Image from 'next/image';

import { Divider } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { convertToLocale } from '@/lib/helpers/money';
import { cn } from '@/lib/utils';

type VariantOption = { label: string; value: string };

const getVariantOptions = (item: any): VariantOption[] => {
  const variantOpts = item.variant?.options;

  if (Array.isArray(variantOpts) && variantOpts.length > 0) {
    return variantOpts
      .map(opt => ({
        label: opt.option?.title,
        value: opt.value
      }))
      .filter(o => o.label && o.value);
  }

  return [];
};

export const OrderProductListItem = ({
  item,
  currency_code,
  withDivider,
  isCanceled
}: {
  item: any;
  currency_code: string;
  withDivider?: boolean;
  isCanceled?: boolean;
}) => {
  const options = getVariantOptions(item);
  const formattedTotal = convertToLocale({
    amount: item.total,
    currency_code
  });
  const formattedOriginal =
    item.original_total != null
      ? convertToLocale({ amount: item.original_total, currency_code })
      : null;
  const showOriginalPrice = formattedOriginal != null && formattedOriginal !== formattedTotal;

  return (
    <Fragment>
      {withDivider && <Divider className="mt-4" />}
      <li className={cn('flex w-full items-center', withDivider && 'mt-2')}>
        <div
          className={cn(
            'relative flex h-24 w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-component-secondary',
            isCanceled && 'opacity-40'
          )}
        >
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title ?? ''}
              width={66}
              height={96}
              className="size-full object-contain"
            />
          ) : (
            <Image
              src="/images/placeholder.svg"
              alt={item.title ?? ''}
              width={45}
              height={45}
              className="opacity-25"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between md:p-4">
          <div className="flex min-w-0 flex-col items-start md:max-w-[310px] md:shrink-0">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              target="_blank"
              className={cn(
                'heading-xs line-clamp-2 w-full overflow-hidden text-ellipsis',
                isCanceled ? 'text-disabled' : 'text-primary'
              )}
            >
              <p className={cn('label-md w-full', isCanceled ? 'text-disabled' : 'text-secondary')}>
                {item.title}
              </p>
              {item.variant_title}
            </LocalizedClientLink>
          </div>
          {options.length > 0 && (
            <div className="label-md flex flex-col items-start gap-0 md:shrink-0 md:whitespace-nowrap">
              {options.map(opt => (
                <div
                  key={opt.label}
                  className="flex items-center gap-1"
                >
                  <span className={isCanceled ? 'text-disabled' : 'text-secondary'}>
                    {opt.label}:
                  </span>
                  <span className={isCanceled ? 'text-disabled' : 'text-primary'}>{opt.value}</span>
                </div>
              ))}
            </div>
          )}
          {isCanceled && (
            <span className="label-sm inline-flex shrink-0 items-center rounded-sm border border-primary bg-primary px-4 py-2 uppercase text-primary">
              Canceled
            </span>
          )}
          <div className="flex flex-col items-start justify-center md:w-[136px] md:shrink-0 md:items-end md:text-right">
            {showOriginalPrice && (
              <p
                className={cn(
                  'label-md line-through',
                  isCanceled ? 'text-disabled' : 'text-secondary'
                )}
              >
                {formattedOriginal}
              </p>
            )}
            <p className={cn('label-lg', isCanceled ? 'text-disabled' : 'text-primary')}>
              {formattedTotal}
            </p>
          </div>
        </div>
      </li>
    </Fragment>
  );
};
