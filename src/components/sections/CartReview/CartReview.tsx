'use client';

import Link from 'next/link';

import { CartSummary } from '@/components/organisms';
import { PromoCode } from '@/components/organisms/PromoCode/PromoCode';

import { CartItems } from './CartItems';
import PaymentButton from './PaymentButton';

const Review = ({ cart }: { cart: any }) => {
  return (
    <div>
      <div className="mb-6 w-full">
        <CartItems cart={cart} />
      </div>

      <div className={'mb-6'}>
        <PromoCode cart={cart} />
      </div>

      <div className="mb-6 w-full rounded-sm border p-4">
        <CartSummary
          item_total={cart?.item_subtotal || 0}
          shipping_total={cart?.shipping_subtotal || 0}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ''}
          tax={cart?.tax_total || 0}
          discount_total={cart?.discount_subtotal || 0}
        />
        <div className="mt-4">
          <PaymentButton
            cart={cart}
            data-testid="submit-order-button"
          />
        </div>
        <p className="label-sm mt-3 text-center font-light text-secondary">
          By clicking the Place order button, you confirm that you have read, understand and accept
          our{' '}
          <Link
            href="/terms-of-use"
            className="underline"
          >
            Terms of Use
          </Link>
          ,{' '}
          <Link
            href="/terms-of-sale"
            className="underline"
          >
            Terms of Sale
          </Link>{' '}
          and{' '}
          <Link
            href="/returns-policy"
            className="underline"
          >
            Returns Policy.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Review;
