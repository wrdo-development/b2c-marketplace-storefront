'use client';

import { useCallback, useEffect, useState } from 'react';

import { RadioGroup } from '@headlessui/react';
import { CreditCard } from '@medusajs/icons';
import { Container, Text } from '@medusajs/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/atoms';
import ErrorMessage from '@/components/molecules/ErrorMessage/ErrorMessage';
import { TickThinIcon } from '@/icons';
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
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get('step') === 'payment';

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

  const paymentReady = (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleEdit = () => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false
    });
  };

  useEffect(() => {
    setError(null);
    setSelectionError(false);
  }, [isOpen]);

  const isEditEnabled = !isOpen && !!cart?.payment_collection?.payment_sessions?.length;

  return (
    <div
      className="overflow-hidden rounded-lg border"
      data-testid="checkout-step-payment"
    >
      <div className="flex items-center justify-between bg-component-secondary p-4">
        <div className="flex items-center gap-2">
          {!isOpen && paymentReady ? (
            <span className="flex w-10 shrink-0 justify-center">
              <TickThinIcon size={24} />
            </span>
          ) : (
            <span className="heading-md w-10 shrink-0 text-center text-primary">3</span>
          )}
          <span className="heading-md uppercase text-primary">PAYMENT</span>
        </div>
        {isEditEnabled && (
          <Button
            data-testid="checkout-payment-edit-button"
            onClick={handleEdit}
            variant="tonal"
          >
            EDIT
          </Button>
        )}
      </div>
      {isOpen && (
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
      )}

      {!isOpen && ((paymentReady && activeSession) || paidByGiftcard) && (
        <div className="border-t border-primary p-4">
          {paymentReady && activeSession ? (
            <div className="flex w-full items-start gap-x-1">
              <div className="flex w-1/3 flex-col">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">Payment method</Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title || activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex w-1/3 flex-col">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">Payment details</Text>
                <div
                  className="txt-medium text-ui-fg-subtle flex items-center gap-2"
                  data-testid="payment-details-summary"
                >
                  <Container className="bg-ui-button-neutral-hover flex h-7 w-fit items-center p-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard />}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : 'Another step will appear'}
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-1/3 flex-col">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">Payment method</Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPaymentSection;
