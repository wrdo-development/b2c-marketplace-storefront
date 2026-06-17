'use client';

import { createContext, useContext } from 'react';

import { UseThreadResult } from './useThread';

/**
 * WRDO spine context (WRDO-180). Holds the single useThread() result so every
 * consumer (ChatBox, UserMessagesSection, MessageButton) shares ONE poll loop.
 */
export const SpineContext = createContext<UseThreadResult | null>(null);

/**
 * Read the shared spine thread. Returns null when used outside a SpineProvider
 * so non-essential consumers (e.g. the message-button badge) can degrade
 * gracefully rather than crash.
 */
export function useSpine(): UseThreadResult | null {
  return useContext(SpineContext);
}
