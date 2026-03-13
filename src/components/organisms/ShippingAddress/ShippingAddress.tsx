import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { Container } from '@medusajs/ui';
import { mapKeys } from 'lodash';
import { usePathname } from 'next/navigation';
import { z } from 'zod';

import { Checkbox, Divider, Input } from '@/components/atoms';
import AddressSelect from '@/components/cells/AddressSelect/AddressSelect';
import CountrySelect from '@/components/cells/CountrySelect/CountrySelect';

const shippingSchema = z.object({
  'shipping_address.first_name': z.string().min(1, 'Please enter first name'),
  'shipping_address.last_name': z.string().min(1, 'Please enter last name'),
  'shipping_address.address_1': z.string().min(1, 'Please enter address'),
  'shipping_address.postal_code': z.string().min(1, 'Please enter post code'),
  'shipping_address.city': z.string().min(1, 'Please enter city'),
  'shipping_address.country_code': z.string().min(1, 'Please select country'),
  email: z.string().min(1, 'Please enter email'),
  'shipping_address.phone': z.string().min(1, 'Please enter phone number')
});

const billingSchema = z.object({
  'billing_address.first_name': z.string().min(1, 'Please enter first name'),
  'billing_address.last_name': z.string().min(1, 'Please enter last name'),
  'billing_address.address_1': z.string().min(1, 'Please enter address'),
  'billing_address.postal_code': z.string().min(1, 'Please enter post code'),
  'billing_address.city': z.string().min(1, 'Please enter city'),
  'billing_address.country_code': z.string().min(1, 'Please select country'),
  'billing_address.phone': z.string().min(1, 'Please enter phone number')
});

export type ShippingAddressHandle = {
  validate: () => boolean;
};

const ShippingAddress = forwardRef<
  ShippingAddressHandle,
  {
    customer: HttpTypes.StoreCustomer | null;
    cart: HttpTypes.StoreCart | null;
    checked: boolean;
    onChange: () => void;
  }
>(({ customer, cart, checked, onChange }, ref) => {
  const pathname = usePathname();

  const locale = pathname.split('/')[1];
  const [billingFormData, setBillingFormData] = useState<Record<string, any>>({
    'billing_address.first_name': cart?.billing_address?.first_name || '',
    'billing_address.last_name': cart?.billing_address?.last_name || '',
    'billing_address.address_1': cart?.billing_address?.address_1 || '',
    'billing_address.company': cart?.billing_address?.company || '',
    'billing_address.tax_id': (cart?.billing_address?.metadata?.tax_id as string) || '',
    'billing_address.postal_code': cart?.billing_address?.postal_code || '',
    'billing_address.city': cart?.billing_address?.city || '',
    'billing_address.country_code': cart?.billing_address?.country_code || locale,
    'billing_address.province': cart?.billing_address?.province || '',
    'billing_address.phone': cart?.billing_address?.phone || ''
  });

  const [formData, setFormData] = useState<Record<string, any>>({
    'shipping_address.first_name': cart?.shipping_address?.first_name || '',
    'shipping_address.last_name': cart?.shipping_address?.last_name || '',
    'shipping_address.address_1': cart?.shipping_address?.address_1 || '',
    'shipping_address.company': cart?.shipping_address?.company || '',
    'shipping_address.postal_code': cart?.shipping_address?.postal_code || '',
    'shipping_address.city': cart?.shipping_address?.city || '',
    'shipping_address.country_code': cart?.shipping_address?.country_code || locale,
    'shipping_address.province': cart?.shipping_address?.province || '',
    'shipping_address.phone': cart?.shipping_address?.phone || '',
    email: cart?.email || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

  const addressesInRegion = useMemo(
    () => customer?.addresses.filter(a => a.country_code && a.country_code === locale),
    [customer?.addresses]
  );

  const addressSnapshot = useMemo(
    () =>
      JSON.stringify({
        shipping_address: cart?.shipping_address,
        email: cart?.email || customer?.email
      }),
    [
      cart?.shipping_address?.first_name,
      cart?.shipping_address?.last_name,
      cart?.shipping_address?.address_1,
      cart?.shipping_address?.company,
      cart?.shipping_address?.postal_code,
      cart?.shipping_address?.city,
      cart?.shipping_address?.country_code,
      cart?.shipping_address?.province,
      cart?.shipping_address?.phone,
      cart?.email,
      customer?.email
    ]
  );

  const setFormAddress = (address?: HttpTypes.StoreCartAddress, email?: string) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        'shipping_address.first_name': address?.first_name || '',
        'shipping_address.last_name': address?.last_name || '',
        'shipping_address.address_1': address?.address_1 || '',
        'shipping_address.company': address?.company || '',
        'shipping_address.postal_code': address?.postal_code || '',
        'shipping_address.city': address?.city || '',
        'shipping_address.country_code': address?.country_code || locale,
        'shipping_address.province': address?.province || '',
        'shipping_address.phone': address?.phone || ''
      }));

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email
      }));
  };

  useEffect(() => {
    if (cart?.shipping_address) {
      setFormAddress(cart.shipping_address, cart.email);
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email);
    }
  }, [addressSnapshot]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBillingFormData({
      ...billingFormData,
      [e.target.name]: e.target.value
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      validate() {
        let isValid = true;

        const shippingResult = shippingSchema.safeParse(formData);
        if (!shippingResult.success) {
          const fieldErrors = shippingResult.error.flatten().fieldErrors;
          setErrors(
            Object.fromEntries(
              Object.entries(fieldErrors).map(([key, msgs]) => [key, msgs?.[0] ?? ''])
            )
          );
          isValid = false;
        } else {
          setErrors({});
        }

        if (!checked) {
          const billingResult = billingSchema.safeParse(billingFormData);
          if (!billingResult.success) {
            const fieldErrors = billingResult.error.flatten().fieldErrors;
            setBillingErrors(
              Object.fromEntries(
                Object.entries(fieldErrors).map(([key, msgs]) => [key, msgs?.[0] ?? ''])
              )
            );
            isValid = false;
          } else {
            setBillingErrors({});
          }
        }

        return isValid;
      }
    }),
    [formData, billingFormData, checked]
  );

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-0">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <div className="grid grid-cols-1 gap-x-4 lg:grid-cols-2">
            <AddressSelect
              addresses={addressesInRegion || []}
              addressInput={
                mapKeys(formData, (_, key) =>
                  key.replace('shipping_address.', '')
                ) as HttpTypes.StoreCartAddress
              }
              onSelect={setFormAddress}
            />
          </div>
        </Container>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData['shipping_address.first_name']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.first_name']}
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData['shipping_address.last_name']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.last_name']}
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Company name (optional)"
          name="shipping_address.company"
          value={formData['shipping_address.company']}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          label="Address"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData['shipping_address.address_1']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.address_1']}
          data-testid="shipping-address-input"
        />
        <Input
          label="Post code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData['shipping_address.postal_code']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.postal_code']}
          data-testid="shipping-postal-code-input"
        />
        <Input
          label="City"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData['shipping_address.city']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.city']}
          data-testid="shipping-city-input"
        />
        <div className="flex flex-col gap-1">
          <CountrySelect
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData['shipping_address.country_code']}
            onChange={handleChange}
            required
            error={!!errors['shipping_address.country_code']}
            data-testid="shipping-country-select"
          />
          {errors['shipping_address.country_code'] && (
            <p className="label-sm text-negative">{errors['shipping_address.country_code']}</p>
          )}
        </div>
        <Input
          label="State / Province (optional)"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData['shipping_address.province']}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          errorMessage={errors['email']}
          data-testid="shipping-email-input"
        />
        <Input
          label="Phone number"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData['shipping_address.phone']}
          onChange={handleChange}
          required
          errorMessage={errors['shipping_address.phone']}
          data-testid="shipping-phone-input"
        />
      </div>
      <div className="mt-4">
        <Checkbox
          name="same_as_billing"
          label="Billing address same as shipping address"
          checked={checked}
          onChange={() => onChange()}
        />
      </div>
      {!checked && (
        <>
          <Divider className="my-4" />
          <p className="heading-md mb-4 uppercase text-primary">Billing address</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Input
              label="First name"
              name="billing_address.first_name"
              autoComplete="given-name"
              value={billingFormData['billing_address.first_name']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.first_name']}
            />
            <Input
              label="Last name"
              name="billing_address.last_name"
              autoComplete="family-name"
              value={billingFormData['billing_address.last_name']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.last_name']}
            />
            <Input
              label="Company name (optional)"
              name="billing_address.company"
              autoComplete="organization"
              value={billingFormData['billing_address.company']}
              onChange={handleBillingChange}
            />
            <Input
              label="Tax ID"
              name="billing_address.tax_id"
              value={billingFormData['billing_address.tax_id']}
              onChange={handleBillingChange}
            />
            <Input
              label="Address"
              name="billing_address.address_1"
              autoComplete="address-line1"
              value={billingFormData['billing_address.address_1']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.address_1']}
            />
            <Input
              label="Post code"
              name="billing_address.postal_code"
              autoComplete="postal-code"
              value={billingFormData['billing_address.postal_code']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.postal_code']}
            />
            <Input
              label="City"
              name="billing_address.city"
              autoComplete="address-level2"
              value={billingFormData['billing_address.city']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.city']}
            />
            <div className="flex flex-col gap-1">
              <CountrySelect
                name="billing_address.country_code"
                autoComplete="country"
                region={cart?.region}
                value={billingFormData['billing_address.country_code']}
                onChange={handleBillingChange}
                required
                error={!!billingErrors['billing_address.country_code']}
              />
              {billingErrors['billing_address.country_code'] && (
                <p className="label-sm text-negative">
                  {billingErrors['billing_address.country_code']}
                </p>
              )}
            </div>
            <Input
              label="State / Province (optional)"
              name="billing_address.province"
              autoComplete="address-level1"
              value={billingFormData['billing_address.province']}
              onChange={handleBillingChange}
            />
            <Input
              label="Phone number"
              name="billing_address.phone"
              autoComplete="tel"
              value={billingFormData['billing_address.phone']}
              onChange={handleBillingChange}
              required
              errorMessage={billingErrors['billing_address.phone']}
            />
          </div>
        </>
      )}
    </>
  );
});

ShippingAddress.displayName = 'ShippingAddress';

export default ShippingAddress;
