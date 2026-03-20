'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button, Checkbox, Divider } from '@/components/atoms';
import { Modal } from '@/components/molecules';
import { MinusThinIcon, PlusIcon } from '@/icons';
import { cancelOrderItems } from '@/lib/data/orders';
import { convertToLocale } from '@/lib/helpers/money';

type VariantOption = {
  option?: { title: string };
  value: string;
};

type OrderItem = {
  id: string;
  title: string;
  thumbnail: string | null;
  quantity: number;
  total: number;
  original_total?: number | null;
  detail?: { fulfilled_quantity?: number };
  variant?: { options?: VariantOption[] };
};

type OrderCancelProps = {
  order: {
    id: string;
    currency_code: string;
    items: OrderItem[];
  };
};

const getCancellableQty = (item: OrderItem) =>
  item.quantity - (item.detail?.fulfilled_quantity ?? 0);

export const OrderCancel = ({ order }: OrderCancelProps) => {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getQuantity = (item: OrderItem) => quantities[item.id] ?? getCancellableQty(item);

  const handleToggle = (item: OrderItem) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        setQuantities(q => ({ ...q, [item.id]: q[item.id] ?? getCancellableQty(item) }));
      }
      return next;
    });
  };

  const handleQuantityChange = (item: OrderItem, delta: number) => {
    const max = getCancellableQty(item);
    setQuantities(prev => ({
      ...prev,
      [item.id]: Math.max(1, Math.min(max, (prev[item.id] ?? 1) + delta))
    }));
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0 || loading) return;
    setLoading(true);
    try {
      const items = Array.from(selectedIds).map(id => ({
        id,
        quantity: quantities[id] ?? 1
      }));
      await cancelOrderItems(order.id, items);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const cancellableItems = order.items.filter(item => getCancellableQty(item) > 0);

  if (cancellableItems.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-8 max-md:pr-0">
          <h2 className="heading-xs uppercase text-primary">CANCEL ORDER</h2>
          <p className="text-md text-secondary">
            Once you place your order, you can cancel it until the seller begins preparation for
            shipment.
          </p>
        </div>
        <Button
          variant="tonal"
          className="label-md w-full uppercase text-action-on-secondary md:w-auto"
          onClick={() => setOpen(true)}
        >
          Cancel
        </Button>
      </div>

      {open && (
        <Modal
          heading="Select items you want to cancel"
          onClose={() => setOpen(false)}
        >
          <div>
            <ul>
              {cancellableItems.map(item => {
                const isSelected = selectedIds.has(item.id);
                const qty = getQuantity(item);
                const maxQty = getCancellableQty(item);
                const variantOptions =
                  item.variant?.options?.filter(o => o.option?.title && o.value) ?? [];
                const formattedTotal = convertToLocale({
                  amount: item.total,
                  currency_code: order.currency_code
                });
                const formattedOriginal =
                  item.original_total != null
                    ? convertToLocale({
                        amount: item.original_total,
                        currency_code: order.currency_code
                      })
                    : null;
                const showOriginal =
                  formattedOriginal != null && formattedOriginal !== formattedTotal;

                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggle(item)}
                    />
                    <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-sm border">
                      <div className="relative h-24 w-[66px] shrink-0 overflow-hidden">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <Image
                            src="/images/placeholder.svg"
                            alt={item.title}
                            fill
                            className="scale-75 object-contain opacity-25"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="heading-xs truncate text-primary">{item.title}</p>
                          {variantOptions.map(opt => (
                            <div
                              key={opt.option?.title}
                              className="label-md flex gap-1"
                            >
                              <span className="text-secondary">{opt.option?.title}:</span>
                              <span className="text-primary">{opt.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
                            disabled={qty <= 1}
                            onClick={() => handleQuantityChange(item, -1)}
                          >
                            <MinusThinIcon size={20} />
                          </button>
                          <div className="label-md flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#eee] bg-component-secondary text-secondary">
                            {qty}
                          </div>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
                            disabled={qty >= maxQty}
                            onClick={() => handleQuantityChange(item, 1)}
                          >
                            <PlusIcon size={20} />
                          </button>
                        </div>
                        <div className="flex shrink-0 flex-col items-end text-right">
                          {showOriginal && (
                            <p className="label-md text-secondary line-through">
                              {formattedOriginal}
                            </p>
                          )}
                          <p className="label-lg text-primary">{formattedTotal}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Divider className="mb-4 mt-2" />
            <div className="px-4">
              <Button
                className="w-full uppercase"
                disabled={selectedIds.size === 0 || loading}
                onClick={handleSubmit}
              >
                Request cancelation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
