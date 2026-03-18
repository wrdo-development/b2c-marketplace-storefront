import Image from 'next/image';

import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CollapseIcon } from '@/icons';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-b border-primary">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <LocalizedClientLink href="/">
            <Image
              src="/Logo.svg"
              width={102}
              height={32}
              alt="Logo"
              priority
            />
          </LocalizedClientLink>
          <LocalizedClientLink href="/cart">
            <Button
              variant="tonal"
              className="flex items-center gap-2"
            >
              <CollapseIcon className="rotate-90" />
              <span>BACK TO CART</span>
            </Button>
          </LocalizedClientLink>
        </div>
        {/* Desktop header */}
        <div className="relative hidden w-full items-center px-8 py-4 lg:flex">
          <LocalizedClientLink href="/cart">
            <Button
              variant="tonal"
              className="flex items-center gap-2"
            >
              <CollapseIcon className="rotate-90" />
              <span>BACK TO SHOPPING CART</span>
            </Button>
          </LocalizedClientLink>
          <div className="absolute left-1/2 -translate-x-1/2">
            <LocalizedClientLink href="/">
              <Image
                src="/Logo.svg"
                width={126}
                height={40}
                alt="Logo"
                priority
              />
            </LocalizedClientLink>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
