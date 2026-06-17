'use client';

import { ChatBox } from '@/components/cells/ChatBox/ChatBox';

/**
 * WRDO spine messages inbox (WRDO-180). TalkJS removed (WRDO-177). This is the
 * full-height view of the single spine thread — it reuses ChatBox (which reads
 * the shared SpineContext), so there's still only one poll loop on the page.
 */
export const UserMessagesSection = () => {
  return (
    <div className="max-w-full h-[655px]">
      <ChatBox fullHeight />
    </div>
  );
};
