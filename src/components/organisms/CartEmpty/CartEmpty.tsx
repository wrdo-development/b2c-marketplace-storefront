import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export function CartEmpty() {
  return (
    <div
      className="col-span-12 flex flex-col py-6"
      data-testid="cart-empty"
    >
      <div className="flex flex-col items-center gap-6 px-4 py-6">
        <div className="flex w-full max-w-[466px] flex-col items-center gap-2 text-center">
          <h2 className="heading-lg w-full font-medium uppercase text-primary">Shopping Cart</h2>
          <p className="w-full text-base font-light text-secondary">
            Your shopping cart is currently empty.
          </p>
        </div>
        <LocalizedClientLink
          href="/categories"
          className="w-full max-w-[466px]"
        >
          <Button className="flex h-12 w-full items-center justify-center uppercase">
            Explore Products
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
}
