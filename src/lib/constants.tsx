import React from 'react';

import { Cash, CreditCard } from '@medusajs/icons';

function VisaLogo() {
  return (
    <div className="flex h-8 w-[54px] items-center justify-center rounded bg-white">
      <span className="text-[10px] font-bold italic tracking-tight text-[#1434CB]">VISA</span>
    </div>
  );
}

function MastercardLogo() {
  return (
    <div className="flex h-8 w-[54px] items-center justify-center rounded bg-white">
      <svg
        width="32"
        height="20"
        viewBox="0 0 32 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="10"
          r="8"
          fill="#EB001B"
        />
        <circle
          cx="20"
          cy="10"
          r="8"
          fill="#F79E1B"
        />
        <path
          d="M16 3.53a8 8 0 0 1 0 12.94A8 8 0 0 1 16 3.53z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}

function PayPalLogo() {
  return (
    <div className="flex h-8 w-[54px] items-center justify-center rounded bg-white">
      <span className="text-[10px] font-bold">
        <span className="text-[#003087]">Pay</span>
        <span className="text-[#009cde]">Pal</span>
      </span>
    </div>
  );
}

function KlarnaLogo() {
  return (
    <div className="flex h-8 w-[54px] items-center justify-center rounded bg-[#feb4c7]">
      <span className="text-[10px] font-medium text-[#1b1b1b]">Klarna.</span>
    </div>
  );
}

/* Map of payment provider_id to their title, icon and logos. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element; logos: React.JSX.Element[] }
> = {
  'pp_card_stripe-connect': {
    title: 'Credit card',
    icon: <CreditCard />,
    logos: [<VisaLogo key="visa" />, <MastercardLogo key="mastercard" />]
  },
  pp_stripe_stripe: {
    title: 'Credit card',
    icon: <CreditCard />,
    logos: [<VisaLogo key="visa" />, <MastercardLogo key="mastercard" />]
  },
  'pp_stripe-ideal_stripe': {
    title: 'iDeal',
    icon: <CreditCard />,
    logos: []
  },
  'pp_stripe-bancontact_stripe': {
    title: 'Bancontact',
    icon: <CreditCard />,
    logos: []
  },
  pp_paypal_paypal: {
    title: 'PayPal',
    icon: <CreditCard />,
    logos: [<PayPalLogo key="paypal" />]
  },
  pp_klarna_klarna: {
    title: 'Klarna',
    icon: <CreditCard />,
    logos: [<KlarnaLogo key="klarna" />]
  },
  pp_system_default: {
    title: 'Manual Payment (for testing purposes only)',
    icon: <Cash />,
    logos: []
  }
  // Add more payment providers here
};

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith('pp_card_stripe-connect');
};
export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith('pp_paypal');
};
export const isManual = (providerId?: string) => {
  return providerId?.startsWith('pp_system_default');
};

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  'krw',
  'jpy',
  'vnd',
  'clp',
  'pyg',
  'xaf',
  'xof',
  'bif',
  'djf',
  'gnf',
  'kmf',
  'mga',
  'rwf',
  'xpf',
  'htg',
  'vuv',
  'xag',
  'xdr',
  'xau'
];

export const PROTECTED_ROUTES = [
  '/user',
  '/user/wishlist',
  '/user/orders',
  '/user/settings',
  '/user/addresses',
  '/user/messages',
  '/user/reviews',
  '/user/returns'
];
