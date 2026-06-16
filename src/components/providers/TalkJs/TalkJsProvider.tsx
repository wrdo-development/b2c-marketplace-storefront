'use client';

import { ReactNode } from 'react';

/**
 * TalkJS removed (WRDO-177): the conversation layer moves to WRDO's own
 * single-thread spine / embedded chat widget, not a 3rd-party SaaS. This is now
 * a pass-through so the layout + callers keep their shape with no TalkJS dep.
 * The WRDO chat widget will slot in here when the spine ships. (wrdo fork)
 */
type TalkJsProviderProps = {
  appId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  children: ReactNode;
};

export function TalkJsProvider({ children }: TalkJsProviderProps) {
  return <>{children}</>;
}
