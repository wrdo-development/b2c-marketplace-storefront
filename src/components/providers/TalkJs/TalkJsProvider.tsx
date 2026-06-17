'use client';

import { ReactNode } from 'react';

import { SpineContext } from '@/components/spine/context';
import { useThread } from '@/components/spine/useThread';

/**
 * WRDO spine provider (WRDO-180).
 *
 * TalkJS was removed (WRDO-177); the conversation layer is now WRDO's own
 * single-thread spine. This provider runs the ONE useThread() poll loop and
 * shares it (via SpineContext) with ChatBox, UserMessagesSection, and
 * MessageButton — so there is never more than one poller on a page.
 *
 * The export name `TalkJsProvider` is kept so callers (layout.tsx, the
 * providers barrel) don't churn. The old TalkJS props are accepted but ignored.
 */
type SpineProviderProps = {
  appId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  children: ReactNode;
};

export function TalkJsProvider({ children }: SpineProviderProps) {
  const thread = useThread();
  return <SpineContext.Provider value={thread}>{children}</SpineContext.Provider>;
}
