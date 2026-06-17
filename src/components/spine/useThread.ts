'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  MessagesResponse,
  SpineMessage,
  SpineMessageContext,
  ThreadResponse,
} from './types';

const POLL_INTERVAL_MS = 3000;

/**
 * useThread — the single client-side engine for the WRDO conversation spine.
 *
 * Same-origin only: every call is a relative `/store/*` fetch with
 * `credentials: 'same-origin'`, so the wrdo_spine httpOnly cookie rides along
 * and there's no CORS. There is no Medusa js-sdk here on purpose.
 *
 * Resilience: a 401 means "not in a spine session yet" — NOT a crash. The
 * widget degrades to a gentle empty state. Network errors during polling are
 * swallowed and retried on the next tick (no console spam).
 *
 * Mount ONE of these (via SpineProvider) so ChatBox + MessageButton share a
 * single poll loop rather than each running their own.
 */
export interface UseThreadResult {
  messages: SpineMessage[];
  send: (text: string, context?: SpineMessageContext) => Promise<void>;
  unreadCount: number;
  /** True until the first poll (or session exchange) resolves. */
  loading: boolean;
  /** True once we know there is a valid spine session (a 2xx, not a 401). */
  hasSession: boolean;
}

function makeClientMsgId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older in-app browsers without crypto.randomUUID.
  return `cmid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Merge incoming messages into existing state, deduping by id and by
 * client_msg_id (so optimistic echoes reconcile with their server copy).
 */
function mergeMessages(
  existing: SpineMessage[],
  incoming: SpineMessage[]
): SpineMessage[] {
  if (incoming.length === 0) return existing;

  const next = [...existing];
  const byId = new Map<string, number>();
  const byClientId = new Map<string, number>();
  next.forEach((m, i) => {
    byId.set(m.id, i);
    if (m.client_msg_id) byClientId.set(m.client_msg_id, i);
  });

  let changed = false;
  for (const msg of incoming) {
    const existingIndex =
      byId.get(msg.id) ??
      (msg.client_msg_id ? byClientId.get(msg.client_msg_id) : undefined);

    if (existingIndex !== undefined) {
      // Reconcile an optimistic/pending message with the confirmed server copy.
      const prev = next[existingIndex];
      next[existingIndex] = {
        ...prev,
        ...msg,
        pending: false,
        client_msg_id: msg.client_msg_id ?? prev.client_msg_id,
      };
      byId.set(msg.id, existingIndex);
      changed = true;
    } else {
      next.push({ ...msg, pending: false });
      byId.set(msg.id, next.length - 1);
      if (msg.client_msg_id) byClientId.set(msg.client_msg_id, next.length - 1);
      changed = true;
    }
  }

  if (!changed) return existing;

  next.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return next;
}

function latestCreatedAt(messages: SpineMessage[]): string | null {
  let cursor: string | null = null;
  for (const m of messages) {
    if (m.pending) continue; // never advance the cursor past unconfirmed echoes
    if (!cursor || new Date(m.created_at).getTime() > new Date(cursor).getTime()) {
      cursor = m.created_at;
    }
  }
  return cursor;
}

export function useThread(): UseThreadResult {
  const [messages, setMessages] = useState<SpineMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Cursor (latest confirmed created_at) kept in a ref so the polling closure
  // always reads the freshest value without re-subscribing the interval.
  const cursorRef = useRef<string | null>(null);

  // Latest poll() kept in a ref so send() can trigger an immediate poll
  // (reusing the single shared loop) without re-subscribing anything.
  const pollRef = useRef<(() => Promise<void>) | null>(null);

  const ingest = useCallback((incoming: SpineMessage[]) => {
    setMessages((prev) => {
      const merged = mergeMessages(prev, incoming);
      const cursor = latestCreatedAt(merged);
      if (cursor) cursorRef.current = cursor;
      return merged;
    });
  }, []);

  /** One poll cycle: fetch new messages + the unread count. */
  const poll = useCallback(async () => {
    try {
      const cursor = cursorRef.current;
      const url = cursor
        ? `/store/messages?after=${encodeURIComponent(cursor)}`
        : '/store/messages';
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });

      if (res.status === 401) {
        // Not in a spine session — degrade gracefully, keep polling silently.
        setHasSession(false);
        return;
      }
      if (!res.ok) return;

      setHasSession(true);
      const data = (await res.json()) as MessagesResponse;
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        ingest(data.messages);
      }
    } catch {
      // Network blip — swallow and retry next tick, no console noise.
    }

    try {
      const res = await fetch('/store/thread', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as ThreadResponse;
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch {
      // ignore
    }
  }, [ingest]);

  // Keep the ref pointing at the freshest poll closure.
  pollRef.current = poll;

  // One-time session exchange (if ?t= is present) + initial poll, then a single
  // shared 3s interval. Cleared on unmount so no orphaned pollers.
  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const start = async () => {
      await exchangeTokenIfPresent();
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      setLoading(false);
      intervalId = setInterval(poll, POLL_INTERVAL_MS);
    };

    void start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [poll]);

  const send = useCallback(
    async (text: string, context?: SpineMessageContext) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const clientMsgId = makeClientMsgId();
      const optimistic: SpineMessage = {
        id: clientMsgId, // temporary id until the server copy lands
        client_msg_id: clientMsgId,
        sender: 'user',
        channel: 'web',
        text: trimmed,
        created_at: new Date().toISOString(),
        context: context ?? null,
        pending: true,
      };
      setMessages((prev) => mergeMessages(prev, [optimistic]));

      try {
        const res = await fetch('/store/messages', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text: trimmed,
            context: context ?? undefined,
            client_msg_id: clientMsgId,
          }),
        });

        if (!res.ok) {
          // 401 (no session) or other failure — drop the optimistic echo so the
          // user isn't shown a message that never reached the spine.
          setMessages((prev) =>
            prev.filter((m) => m.client_msg_id !== clientMsgId)
          );
          return;
        }

        setHasSession(true);
        // Deliberately do NOT inject the POST response's wrdo reply into state.
        // The reply is the spine's, with its own server id and no client_msg_id;
        // injecting it locally (with a freshly-minted id) would collide with the
        // same reply arriving on the next poll under a DIFFERENT id, which dedupe
        // can't reconcile → a transient duplicate bubble. Instead let the poll
        // loop deliver the reply as the single source of truth. (A 401/failure
        // is already handled by the !res.ok branch above, which drops the
        // optimistic echo.) Trigger an immediate poll so the reply appears fast
        // rather than waiting up to 3s.
        void pollRef.current?.();
      } catch {
        setMessages((prev) =>
          prev.filter((m) => m.client_msg_id !== clientMsgId)
        );
      }
    },
    []
  );

  return { messages, send, unreadCount, loading, hasSession };
}

// Module-level guard so the single-use token exchange runs at most once per
// page load for a given token. React Strict Mode (dev) double-invokes effects
// and a genuine double-mount can both fire exchangeTokenIfPresent twice; the
// 2nd call would burn nothing (verifyAndBurn is single-use) and harmlessly 401,
// but it's a wasted request and a race. Keying off the token value means a
// second attempt with the SAME ?t= is a no-op.
let exchangedToken: string | null = null;

/**
 * If the URL carries a `?t=<token>` handoff token, exchange it for the
 * wrdo_spine httpOnly cookie, then strip `t` from the URL via
 * history.replaceState so it can't be re-used or leaked (back button / share).
 */
async function exchangeTokenIfPresent(): Promise<void> {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const token = params.get('t');
  if (!token) return;

  // Already exchanged this exact token this page load — no-op (Strict Mode /
  // double-mount safety).
  if (exchangedToken === token) return;
  exchangedToken = token;

  try {
    await fetch('/store/session/exchange', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ t: token }),
    });
  } catch {
    // If the exchange fails we still strip the token — a bad/expired token
    // shouldn't linger in the address bar.
  }

  params.delete('t');
  const query = params.toString();
  const newUrl =
    window.location.pathname +
    (query ? `?${query}` : '') +
    window.location.hash;
  window.history.replaceState(null, '', newUrl);
}
