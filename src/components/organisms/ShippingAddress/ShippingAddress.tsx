import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';

import { HttpTypes } from '@medusajs/types';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { z } from 'zod';

import { Button, Checkbox, Divider, Input } from '@/components/atoms';
import { AddressForm, Modal } from '@/components/molecules';
import { AddressFormData } from '@/components/molecules/AddressForm/schema';
import CountrySelect from '@/components/cells/CountrySelect/CountrySelect';
import { deleteCustomerAddress } from '@/lib/data/customer';
import { cn } from '@/lib/utils';
import { MeatballsMenuIcon, PlusIcon } from '@/icons';

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

type AddressCardProps = {
  address: HttpTypes.StoreCustomerAddress;
  customerEmail: string;
  selected: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center p-[10px]">
      <div
        className={cn(
          'flex size-5 items-center justify-center rounded-full',
          selected
            ? 'border border-action'
            : 'border border-secondary bg-component-secondary'
        )}
      >
        {selected && <div className="size-3 rounded-full bg-action" />}
      </div>
    </div>
  );
}

function AddressCard({
  address,
  customerEmail,
  selected,
  menuOpen,
  onSelect,
  onMenuToggle,
  onEdit,
  onDelete
}: AddressCardProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onMenuToggle();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, onMenuToggle]);

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-5 rounded-lg border px-4 py-5',
        selected ? 'border-secondary' : 'border-primary'
      )}
      onClick={onSelect}
    >
      <RadioIndicator selected={selected} />
      <div className="label-md min-w-0 flex-1 font-medium text-primary">
        {address.first_name} {address.last_name}
      </div>
      <div className="label-md min-w-0 flex-1 text-secondary">
        <p>{address.address_1}</p>
        <p>
          {address.postal_code}, {address.city},{' '}
          {address.country_code?.toUpperCase()}
        </p>
      </div>
      <div className="label-md min-w-0 flex-1 overflow-hidden text-secondary">
        <p className="truncate">{customerEmail}</p>
        <p>{address.phone}</p>
      </div>
      <div
        className="relative shrink-0"
        ref={menuRef}
        onClick={e => {
          e.stopPropagation();
          onMenuToggle();
        }}
      >
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg hover:bg-component-secondary"
        >
          <MeatballsMenuIcon size={20} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 min-w-[120px] rounded-lg border bg-primary shadow-md">
            <button
              type="button"
              className="label-md w-full px-4 py-2 text-left hover:bg-component-secondary"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="label-md w-full px-4 py-2 text-left text-negative hover:bg-component-secondary"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const router = useRouter();

  const locale = pathname.split('/')[1];

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<HttpTypes.StoreCustomerAddress | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  // Compute initial address for logged-in users synchronously
  const getAddressesInRegionOnce = () =>
    (customer?.addresses as HttpTypes.StoreCustomerAddress[] | undefined)?.filter(
      a => a.country_code && a.country_code === locale
    ) ?? [];

  const getInitialSelectedId = (): string | null => {
    const addrs = getAddressesInRegionOnce();
    if (!addrs.length) return null;
    const cartAddr = cart?.shipping_address;
    if (cartAddr?.address_1) {
      const match = addrs.find(
        a => a.address_1 === cartAddr.address_1 && a.postal_code === cartAddr.postal_code
      );
      if (match?.id) return match.id;
    }
    return addrs[0]?.id ?? null;
  };

  const getInitialFormData = (): Record<string, any> => {
    // Use cart shipping address if already set
    const cartAddr = cart?.shipping_address;
    if (cartAddr?.first_name) {
      return {
        'shipping_address.first_name': cartAddr.first_name || '',
        'shipping_address.last_name': cartAddr.last_name || '',
        'shipping_address.address_1': cartAddr.address_1 || '',
        'shipping_address.company': cartAddr.company || '',
        'shipping_address.postal_code': cartAddr.postal_code || '',
        'shipping_address.city': cartAddr.city || '',
        'shipping_address.country_code': cartAddr.country_code || locale,
        'shipping_address.province': cartAddr.province || '',
        'shipping_address.phone': cartAddr.phone || '',
        email: cart?.email || customer?.email || ''
      };
    }
    // Fall back to first saved address for logged-in users
    const addrs = getAddressesInRegionOnce();
    if (addrs.length) {
      const cartAddrMatch = cart?.shipping_address?.address_1
        ? addrs.find(
            a =>
              a.address_1 === cart.shipping_address?.address_1 &&
              a.postal_code === cart.shipping_address?.postal_code
          ) ?? addrs[0]
        : addrs[0];
      return {
        'shipping_address.first_name': cartAddrMatch.first_name || '',
        'shipping_address.last_name': cartAddrMatch.last_name || '',
        'shipping_address.address_1': cartAddrMatch.address_1 || '',
        'shipping_address.company': cartAddrMatch.company || '',
        'shipping_address.postal_code': cartAddrMatch.postal_code || '',
        'shipping_address.city': cartAddrMatch.city || '',
        'shipping_address.country_code': cartAddrMatch.country_code || locale,
        'shipping_address.province': cartAddrMatch.province || '',
        'shipping_address.phone': cartAddrMatch.phone || '',
        email: customer?.email || ''
      };
    }
    return {
      'shipping_address.first_name': '',
      'shipping_address.last_name': '',
      'shipping_address.address_1': '',
      'shipping_address.company': '',
      'shipping_address.postal_code': '',
      'shipping_address.city': '',
      'shipping_address.country_code': locale,
      'shipping_address.province': '',
      'shipping_address.phone': '',
      email: customer?.email || ''
    };
  };

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(getInitialSelectedId);

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

  const [formData, setFormData] = useState<Record<string, any>>(getInitialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a: HttpTypes.StoreCustomerAddress) => a.country_code && a.country_code === locale
      ),
    [customer?.addresses]
  );

  const isLoggedInWithAddresses = !!(customer && (addressesInRegion?.length || 0) > 0);

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

  const handleSelectAddress = useCallback(
    (address: HttpTypes.StoreCustomerAddress) => {
      setSelectedAddressId(address.id);
      setSelectionError('');
      setFormAddress(address as any, customer?.email);
    },
    [customer?.email]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return;
    await deleteCustomerAddress(deleteAddressId);
    setDeleteAddressId(null);
    // If deleted address was selected, clear selection
    if (selectedAddressId === deleteAddressId) {
      setSelectedAddressId(null);
    }
    router.refresh();
  };

  const validateBilling = (): boolean => {
    if (checked) return true;
    const billingResult = billingSchema.safeParse(billingFormData);
    if (!billingResult.success) {
      const fieldErrors = billingResult.error.flatten().fieldErrors;
      setBillingErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, msgs]) => [key, msgs?.[0] ?? ''])
        )
      );
      return false;
    }
    setBillingErrors({});
    return true;
  };

  useImperativeHandle(
    ref,
    () => ({
      validate() {
        // Card selection mode: require a card to be selected
        if (isLoggedInWithAddresses && !showAddForm) {
          if (!selectedAddressId) {
            setSelectionError('Please select a shipping address');
            return false;
          }
          setSelectionError('');
          return validateBilling();
        }

        // Form mode: validate form fields
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

        if (!validateBilling()) {
          isValid = false;
        }

        return isValid;
      }
    }),
    [formData, billingFormData, checked, isLoggedInWithAddresses, showAddForm, selectedAddressId]
  );

  const editingAddressDefaultValues: AddressFormData | null = editingAddress
    ? {
        addressId: editingAddress.id,
        addressName: editingAddress.address_name || '',
        firstName: editingAddress.first_name || '',
        lastName: editingAddress.last_name || '',
        address: editingAddress.address_1 || '',
        city: editingAddress.city || '',
        countryCode: editingAddress.country_code || '',
        postalCode: editingAddress.postal_code || '',
        company: editingAddress.company || '',
        province: editingAddress.province || '',
        phone: editingAddress.phone || customer?.phone || ''
      }
    : null;

  const regions = cart?.region ? [cart.region] : [];

  const formFields = (
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
  );

  const billingForm = (
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
  );

  if (isLoggedInWithAddresses) {
    return (
      <>
        {/* Header row */}
        <div className="flex items-center justify-between pb-4">
          <p className="heading-sm text-primary">
            {showAddForm ? 'Add new address' : 'Select your address'}
          </p>
          {showAddForm ? (
            <Button
              type="button"
              variant="tonal"
              onClick={() => setShowAddForm(false)}
            >
              CANCEL
            </Button>
          ) : (
            <Button
              type="button"
              variant="tonal"
              onClick={() => setShowAddForm(true)}
            >
              <span className="flex items-center gap-2">
                <PlusIcon size={16} />
                ADD NEW ADDRESS
              </span>
            </Button>
          )}
        </div>

        {!showAddForm ? (
          /* Address cards */
          <div className="flex flex-col">
            {addressesInRegion!.map((address: HttpTypes.StoreCustomerAddress) => (
              <AddressCard
                key={address.id}
                address={address}
                customerEmail={customer!.email}
                selected={selectedAddressId === address.id}
                menuOpen={menuOpenId === address.id}
                onSelect={() => handleSelectAddress(address)}
                onMenuToggle={() =>
                  setMenuOpenId(menuOpenId === address.id ? null : address.id)
                }
                onEdit={() => {
                  setEditingAddress(address);
                  setMenuOpenId(null);
                }}
                onDelete={() => {
                  setDeleteAddressId(address.id);
                  setMenuOpenId(null);
                }}
              />
            ))}
            {selectionError && (
              <p className="label-sm text-negative">{selectionError}</p>
            )}
            {/* Hidden inputs so parent form action receives the selected address data */}
            {selectedAddressId && (
              <>
                <input type="hidden" name="shipping_address.first_name" value={formData['shipping_address.first_name']} />
                <input type="hidden" name="shipping_address.last_name" value={formData['shipping_address.last_name']} />
                <input type="hidden" name="shipping_address.address_1" value={formData['shipping_address.address_1']} />
                <input type="hidden" name="shipping_address.company" value={formData['shipping_address.company']} />
                <input type="hidden" name="shipping_address.postal_code" value={formData['shipping_address.postal_code']} />
                <input type="hidden" name="shipping_address.city" value={formData['shipping_address.city']} />
                <input type="hidden" name="shipping_address.country_code" value={formData['shipping_address.country_code']} />
                <input type="hidden" name="shipping_address.province" value={formData['shipping_address.province']} />
                <input type="hidden" name="shipping_address.phone" value={formData['shipping_address.phone']} />
                <input type="hidden" name="email" value={formData['email']} />
              </>
            )}
          </div>
        ) : (
          /* Inline add form */
          formFields
        )}

        <div className="mt-4">
          <Checkbox
            name="same_as_billing"
            label="Billing address same as shipping address"
            checked={checked}
            onChange={() => onChange()}
          />
        </div>
        {!checked && billingForm}

        {/* Edit address modal */}
        {editingAddress && editingAddressDefaultValues && (
          <Modal
            heading="Edit address"
            onClose={() => setEditingAddress(null)}
          >
            <AddressForm
              regions={regions as HttpTypes.StoreRegion[]}
              defaultValues={editingAddressDefaultValues}
              handleClose={() => {
                setEditingAddress(null);
                router.refresh();
              }}
            />
          </Modal>
        )}

        {/* Delete address confirmation modal */}
        {deleteAddressId && (
          <Modal
            heading="Confirm your action"
            onClose={() => setDeleteAddressId(null)}
          >
            <div className="flex flex-col gap-4 px-4">
              <p>Are you sure you want to delete this address?</p>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="tonal"
                  onClick={() => setDeleteAddressId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAddress}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // Guest or logged-in user with no saved addresses: show form directly
  return (
    <>
      {formFields}
      <div className="mt-4">
        <Checkbox
          name="same_as_billing"
          label="Billing address same as shipping address"
          checked={checked}
          onChange={() => onChange()}
        />
      </div>
      {!checked && billingForm}
    </>
  );
});

ShippingAddress.displayName = 'ShippingAddress';

export default ShippingAddress;
