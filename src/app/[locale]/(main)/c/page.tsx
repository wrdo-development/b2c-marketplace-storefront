import type { Metadata } from 'next';

import { ChatBox } from '@/components/cells/ChatBox/ChatBox';

export const metadata: Metadata = {
  title: 'WRDO',
  // This is a private handoff landing — never index it.
  robots: { index: false, follow: false },
};

/**
 * WRDO WhatsApp → web handoff landing (WRDO-180).
 *
 * The minted link is shop.wrdo.co.za/c?t=<token>. This route lives under the
 * (main) group, so it inherits the spine provider (TalkJsProvider) and chrome.
 * The provider's useThread() exchanges the ?t= token for the wrdo_spine cookie
 * on mount and strips it from the URL — so this page just renders the full-
 * height chat surface and the conversation "just continues".
 */
export default function ConversationHandoffPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] w-full max-w-2xl flex-col px-4 py-4">
      <p className="pb-3 text-center text-sm text-secondary">
        Continuing your WRDO conversation…
      </p>
      <div className="flex-1 overflow-hidden rounded-sm border border-action-secondary">
        <ChatBox fullHeight />
      </div>
    </div>
  );
}
