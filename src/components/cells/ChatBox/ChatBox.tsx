'use client';

import { useState } from 'react';

import { useSpine } from '@/components/spine/context';
import { MessageList } from '@/components/spine/MessageList';
import { SpineAction, SpineMessageContext } from '@/components/spine/types';

/**
 * WRDO spine chat surface (WRDO-180). TalkJS removed (WRDO-177); this is now the
 * real chat widget. It reads the shared spine thread from SpineContext (one poll
 * loop for the whole page) and sends via the same-origin /store/messages API.
 *
 * Props signature preserved from the TalkJS removal so callers (Chat.tsx) don't
 * break. currentUser/supportUser are no longer needed for transport (the spine
 * is keyed by cookie) but order_id/product_id/subject ride along as message
 * context.
 */
type ChatProps = {
  order_id?: string;
  product_id?: string;
  subject?: string | null;
  currentUser?: {
    id: string;
    name: string;
    email?: string | null;
    photoUrl?: string;
    role: string;
  };
  supportUser?: {
    id: string;
    name: string;
    email?: string | null;
    photoUrl?: string;
    role: string;
  };
  /** Render full-height (used by the /c handoff landing). */
  fullHeight?: boolean;
};

export function ChatBox({ order_id, product_id, subject, fullHeight }: ChatProps) {
  const spine = useSpine();
  const [draft, setDraft] = useState('');

  const context: SpineMessageContext = { order_id, product_id, subject };

  const handleSend = () => {
    if (!spine) return;
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    void spine.send(text, context);
  };

  const handleAction = (action: SpineAction) => {
    if (!spine) return;
    void spine.send(action.label, context);
  };

  const emptyState = spine?.loading
    ? 'Loading your conversation…'
    : 'Start the conversation — WRDO is here to help.';

  return (
    <div
      className={`flex w-full flex-col ${fullHeight ? 'h-full' : 'h-[500px]'}`}
      data-testid="spine-chatbox"
    >
      <MessageList
        messages={spine?.messages ?? []}
        onAction={handleAction}
        emptyState={emptyState}
      />

      {/* Sticky composer. The container scrolls, not the input — so the iOS
          keyboard doesn't shove the input off-screen on focus. */}
      <div className="sticky bottom-0 flex items-end gap-2 border-t border-action-secondary bg-primary p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Type a message…"
          aria-label="Message"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-sm border bg-component-secondary px-4 py-3 text-md focus:border-primary focus:outline-none focus:ring-0"
          data-testid="spine-composer-input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || !spine}
          className="h-[44px] shrink-0 rounded-sm bg-action px-5 text-md text-action-on-primary transition-colors hover:bg-action-hover active:bg-action-pressed disabled:bg-disabled disabled:text-disabled"
          data-testid="spine-composer-send"
        >
          Send
        </button>
      </div>
    </div>
  );
}
