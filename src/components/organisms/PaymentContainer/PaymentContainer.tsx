import React, { useContext, useMemo, type JSX } from 'react';

import { Radio as RadioGroupOption } from '@headlessui/react';
import { CardElement } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';

import { Radio } from '@/components/atoms';

import SkeletonCardDetails from './SkeletonCardDetails';
import { StripeContext } from './StripeWrapper';

type PaymentContainerProps = {
  paymentProviderId: string;
  selectedPaymentOptionId: string | null;
  disabled?: boolean;
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element; logos: JSX.Element[] }>;
  children?: React.ReactNode;
  hasValidationError?: boolean;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
  hasValidationError = false
}) => {
  const isSelected = selectedPaymentOptionId === paymentProviderId;

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-2 rounded-lg py-2 pl-1 pr-3 hover:bg-component-secondary">
        <Radio
          selected={isSelected}
          hasError={!isSelected && hasValidationError}
        />
        <div className="flex min-w-0 flex-1 items-center justify-between">
          <span className="label-md text-primary">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {paymentInfoMap[paymentProviderId]?.logos}
          </div>
        </div>
      </div>
      {children}
    </RadioGroupOption>
  );
};

export default PaymentContainer;

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  hasValidationError = false,
  setCardBrand,
  setError,
  setCardComplete
}: Omit<PaymentContainerProps, 'children'> & {
  setCardBrand: (brand: string) => void;
  setError: (error: string | null) => void;
  setCardComplete: (complete: boolean) => void;
}) => {
  const stripeReady = useContext(StripeContext);

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: 'Inter, sans-serif',
          color: '#424270',
          '::placeholder': {
            color: 'rgb(107 114 128)'
          }
        }
      },
      classes: {
        base: 'pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out'
      }
    };
  }, []);

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
      hasValidationError={hasValidationError}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 px-3 transition-all duration-150 ease-in-out">
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={e => {
                setCardBrand(e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1));
                setError(e.error?.message || null);
                setCardComplete(e.complete);
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  );
};
