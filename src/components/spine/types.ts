/**
 * WRDO conversation-spine types (WRDO-180).
 *
 * The spine is one server-side conversation thread that WhatsApp, the storefront
 * web widget, and the canvas are all windows onto. These types mirror the
 * same-origin `/store/*` spine API.
 */

export type SpineSender = 'user' | 'wrdo';

/** A message as returned by GET /store/messages. */
export interface SpineMessage {
  id: string;
  sender: SpineSender;
  channel: string;
  text: string;
  created_at: string;
  context?: SpineMessageContext | null;
  /** Local-only echo while an optimistic send is in flight. */
  client_msg_id?: string;
  /** wrdo reply action buttons (from the WebRenderer payload). */
  actions?: SpineAction[];
  /** True until the send round-trips / the message shows up in a poll. */
  pending?: boolean;
}

/** Tappable action on a wrdo message (WebRenderer payload). */
export interface SpineAction {
  id: string;
  label: string;
}

/** Optional context attached to a sent message (order / product / subject). */
export interface SpineMessageContext {
  order_id?: string;
  product_id?: string;
  subject?: string | null;
  [key: string]: unknown;
}

/** WebRenderer payload returned by POST /store/messages. */
export interface WebRendererPayload {
  kind: 'web';
  text: string;
  actions?: SpineAction[];
}

/** GET /store/messages response. */
export interface MessagesResponse {
  messages: SpineMessage[];
}

/** GET /store/thread response. */
export interface ThreadResponse {
  thread: unknown;
  unreadCount: number;
}
