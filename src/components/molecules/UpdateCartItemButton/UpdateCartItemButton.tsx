'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCartContext } from '@/components/providers';
import { MinusThinIcon, PlusIcon } from '@/icons';
import { toast } from '@/lib/helpers/toast';

export const UpdateCartItemButton = ({
  quantity,
  lineItemId
}: {
  quantity: number;
  lineItemId: string;
}) => {
  const { updateCartItem, isUpdatingItem } = useCartContext();
  const [pendingQuantity, setPendingQuantity] = useState(quantity);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);
  const router = useRouter();

  useEffect(() => {
    setPendingQuantity(quantity);
  }, [quantity]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // Update UI immediately (optimistic update)
    setPendingQuantity(newQuantity);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateCartItem(lineItemId, newQuantity);
        router.refresh();
      } catch (error: unknown) {
        setPendingQuantity(quantity);
        const errorMessage =
          error instanceof Error
            ? error.message.replace('Error setting up the request: ', '')
            : 'Failed to update quantity';
        toast.error({
          title: 'Error updating cart',
          description: errorMessage
        });
      }
    }, 500);
  };

  const isDecreaseDisabled = pendingQuantity === 1 || isUpdatingItem || !lineItemId;
  const isIncreaseDisabled = isUpdatingItem || !lineItemId;

  return (
    <div className="flex items-center gap-1">
      <button
        className="flex size-10 items-center justify-center rounded-sm hover:bg-action-secondary-hover disabled:cursor-not-allowed disabled:opacity-40"
        disabled={isDecreaseDisabled}
        onClick={() => handleQuantityChange(pendingQuantity - 1)}
        aria-label="Decrease quantity"
      >
        <MinusThinIcon size={20} />
      </button>
      <div className="label-md flex size-10 select-none items-center justify-center rounded-sm border bg-secondary text-center text-secondary">
        {pendingQuantity}
      </div>
      <button
        className="flex size-10 items-center justify-center rounded-sm hover:bg-action-secondary-hover disabled:cursor-not-allowed disabled:opacity-40"
        disabled={isIncreaseDisabled}
        onClick={() => handleQuantityChange(pendingQuantity + 1)}
        aria-label="Increase quantity"
      >
        <PlusIcon size={20} />
      </button>
    </div>
  );
};
