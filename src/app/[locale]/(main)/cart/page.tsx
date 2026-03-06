import { Suspense } from 'react';

import { Metadata } from 'next';

import { Cart } from '@/components/sections';
import { retrieveCustomer } from '@/lib/data/customer';
import { getUserWishlists } from '@/lib/data/wishlist';
import { Wishlist } from '@/types/wishlist';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'My cart page'
};

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const user = await retrieveCustomer();

  let wishlist: Wishlist = { products: [] };
  if (user) {
    wishlist = await getUserWishlists({ countryCode: locale });
  }

  return (
    <main className="container grid grid-cols-12">
      <Suspense fallback={<>Loading...</>}>
        <Cart
          user={user}
          wishlist={wishlist}
        />
      </Suspense>
    </main>
  );
}
