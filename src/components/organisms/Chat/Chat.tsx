'use client';

import { useState } from 'react';

import { HttpTypes } from '@medusajs/types';

import { Button } from '@/components/atoms';
import { ChatBox } from '@/components/cells/ChatBox/ChatBox';
import { Modal } from '@/components/molecules';
import { MessageIcon } from '@/icons';
import { SellerProps } from '@/types/seller';

export const Chat = ({
  user,
  seller,
  buttonClassNames,
  icon,
  product,
  subject,
  order_id,
  variant = 'tonal',
  buttonSize = 'small'
}: {
  user: HttpTypes.StoreCustomer | null;
  seller: SellerProps;
  buttonClassNames?: string;
  icon?: boolean;
  product?: HttpTypes.StoreProduct;
  subject?: string;
  order_id?: string;
  variant?: 'tonal' | 'filled';
  buttonSize?: 'small' | 'large';
}) => {
  const [modal, setModal] = useState(false);

  // The WRDO spine is keyed by the wrdo_spine cookie, not by user/seller email,
  // but keep the guard so the "write to seller" entry only shows in a logged-in
  // buyer↔seller context (mirrors the pre-spine behaviour).
  if (!user?.id || !seller?.id) {
    return null;
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Customer';
  const sellerName = seller.name || 'Seller';

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setModal(true)}
        className={buttonClassNames}
        size={buttonSize}
      >
        {icon ? <MessageIcon size={20} /> : 'Write to seller'}
      </Button>
      {modal && (
        <Modal
          heading="Chat"
          onClose={() => setModal(false)}
        >
          <div className="px-4">
            <ChatBox
              order_id={order_id}
              product_id={product?.id}
              subject={subject || product?.title || null}
              currentUser={{
                id: user.id,
                name: userName,
                email: user.email,
                photoUrl: '/talkjs-placeholder.jpg',
                role: 'customer'
              }}
              supportUser={{
                id: seller.id,
                name: sellerName,
                email: seller.email,
                photoUrl: seller.photo || '/talkjs-placeholder.jpg',
                role: 'seller'
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
