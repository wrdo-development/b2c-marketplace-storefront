"use client"

import { useSpine } from "@/components/spine/context"
import { MessageIcon } from "@/icons"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"

/**
 * Message button (WRDO-180). TalkJS removed (WRDO-177). The unread badge is back
 * — sourced from the shared spine thread (SpineContext), so it piggy-backs on
 * the single poll loop rather than starting its own. Link to /user/messages
 * preserved. Degrades to a plain icon when rendered outside a SpineProvider.
 */
export const MessageButton = () => {
  const spine = useSpine()
  const unreadCount = spine?.unreadCount ?? 0

  return (
    <LocalizedClientLink href="/user/messages" className="relative">
      <MessageIcon size={20} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-2 -right-2 flex min-w-[18px] items-center justify-center rounded-full bg-action px-1 text-[10px] leading-none text-action-on-primary h-[18px]"
          aria-label={`${unreadCount} unread messages`}
          data-testid="message-button-unread-badge"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </LocalizedClientLink>
  )
}
