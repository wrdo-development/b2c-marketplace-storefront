import { Suspense } from 'react';

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import PaymentWrapper from '@/components/organisms/PaymentContainer/PaymentWrapper';
import { CartAddressSection } from '@/components/sections/CartAddressSection/CartAddressSection';
import CartPaymentSection from '@/components/sections/CartPaymentSection/CartPaymentSection';
import CartReview from '@/components/sections/CartReview/CartReview';
import CartShippingMethodsSection from '@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection';
import { retrieveCart } from '@/lib/data/cart';
import { retrieveCustomer } from '@/lib/data/customer';
import { listCartShippingMethods } from '@/lib/data/fulfillment';
import { listCartPaymentMethods } from '@/lib/data/payment';
import isAddressComplete from '@/lib/helpers/is-address-complete';
import { isDeliveryComplete } from '@/lib/helpers/is-delivery-complete';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'My cart page - Checkout'
};

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          className="container flex items-center justify-center"
          data-testid="checkout-page-loading"
        >
          Loading...
        </div>
      }
    >
      <CheckoutPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckoutPageContent({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const cart = await retrieveCart();

  if (!cart) {
    return notFound();
  }

  const { step } = await searchParams;
  const shippingMethods = await listCartShippingMethods(cart.id, false);
  const addressComplete = isAddressComplete(cart.shipping_address);
  const deliveryComplete = isDeliveryComplete(cart, shippingMethods);

  if (!step) {
    if (!addressComplete) redirect('/checkout?step=address');
    else if (!deliveryComplete) redirect('/checkout?step=delivery');
    else redirect('/checkout?step=payment');
  }

  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? '');
  const customer = await retrieveCustomer();

  return (
    <PaymentWrapper cart={cart}>
      <main
        className="container p-4 lg:p-5"
        data-testid="checkout-page"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-11">
          <div
            className="flex flex-col gap-6 lg:col-span-6"
            data-testid="checkout-steps-container"
          >
            <CartAddressSection
              cart={cart}
              customer={customer}
            />
            <CartShippingMethodsSection
              cart={cart}
              availableShippingMethods={shippingMethods}
            />
            <CartPaymentSection
              cart={cart}
              availablePaymentMethods={paymentMethods}
            />
          </div>

          <div
            className="lg:col-span-5"
            data-testid="checkout-review-container"
          >
            <CartReview cart={cart} />
          </div>
        </div>
      </main>
    </PaymentWrapper>
  );
}
