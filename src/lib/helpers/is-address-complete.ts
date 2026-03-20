import type { HttpTypes } from '@medusajs/types';

const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'address_1',
  'city',
  'postal_code',
  'country_code',
] as const;

export default function isAddressComplete(
  address: HttpTypes.StoreAddress | null | undefined
): boolean {
  if (!address) return false;
  return REQUIRED_FIELDS.every(field => Boolean(address[field]?.trim()));
}
