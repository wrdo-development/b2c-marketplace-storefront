'use client';

import { useState } from 'react';

import { RadioGroup } from '@headlessui/react';
import { Text } from '@medusajs/ui';

import { Button } from '@/components/atoms';
import ErrorMessage from '@/components/molecules/ErrorMessage/ErrorMessage';
import { initiatePaymentSession } from '@/lib/data/cart';

import { isStripe as isStripeFunc, paymentInfoMap } from '../../../lib/constants';
import PaymentContainer, {
  StripeCardContainer
} from '../../organisms/PaymentContainer/PaymentContainer';

type StoreCardPaymentMethod = any & {
  service_zone?: {
    fulfillment_set: {
      type: string;
    };
  };
};

const CartPaymentSection = ({
  cart,
  availablePaymentMethods
}: {
  cart: any;
  availablePaymentMethods: StoreCardPaymentMethod[] | null;
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === 'pending'
  );

  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState(false);
  const [, setCardBrand] = useState<string | null>(null);
  const [, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  );

  const setPaymentMethod = async (method: string) => {
    setError(null);
    setSelectionError(false);
    setSelectedPaymentMethod(method);
    try {
      await initiatePaymentSession(cart, {
        provider_id: method
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  return (
    <div
      className="overflow-hidden rounded-lg border"
      data-testid="checkout-step-payment"
    >
      <div className="flex items-center justify-between bg-component-secondary p-4">
        <div className="flex items-center gap-2">
          <span className="heading-md w-10 shrink-0 text-center text-primary">3</span>
          <span className="heading-md uppercase text-primary">PAYMENT</span>
        </div>
      </div>
      <div className="border-t border-primary p-2">
        {!paidByGiftcard && availablePaymentMethods?.length && (
          <>
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(value: string) => setPaymentMethod(value)}
            >
              {availablePaymentMethods.map(paymentMethod => (
                <div key={paymentMethod.id}>
                  {isStripeFunc(paymentMethod.id) ? (
                    <StripeCardContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      paymentInfoMap={paymentInfoMap}
                      hasValidationError={selectionError}
                      setCardBrand={setCardBrand}
                      setError={setError}
                      setCardComplete={setCardComplete}
                    />
                  ) : (
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      hasValidationError={selectionError}
                    />
                  )}
                </div>
              ))}
            </RadioGroup>
            {selectionError && (
              <p className="label-sm mt-1 px-1 text-negative">Please select a payment method</p>
            )}
          </>
        )}

        {paidByGiftcard && (
          <div className="flex w-1/3 flex-col p-2">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">Payment method</Text>
            <Text
              className="txt-medium text-ui-fg-subtle"
              data-testid="payment-method-summary"
            >
              Gift card
            </Text>
          </div>
        )}

        <ErrorMessage
          error={error}
          data-testid="payment-method-error-message"
        />
      </div>
    </div>
  );
};

export default CartPaymentSection;
