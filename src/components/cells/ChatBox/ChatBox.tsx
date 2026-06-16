'use client';

/**
 * TalkJS removed (WRDO-177). Chat moves to WRDO's single-thread spine widget.
 * Signature preserved so callers (Chat.tsx) don't break; renders a neutral
 * placeholder until the WRDO widget slots in here. (wrdo fork)
 */
type ChatProps = {
  order_id?: string;
  product_id?: string;
  subject?: string | null;
  currentUser: {
    id: string;
    name: string;
    email: string | null;
    photoUrl?: string;
    role: string;
  };
  supportUser: {
    id: string;
    name: string;
    email: string | null;
    photoUrl?: string;
    role: string;
  };
};

export function ChatBox(_props: ChatProps) {
  return (
    <div className="h-[500px] w-full flex items-center justify-center text-center text-sm text-secondary">
      Chat is moving to WRDO — coming soon.
    </div>
  );
}
