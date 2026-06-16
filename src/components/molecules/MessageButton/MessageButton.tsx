"use client"

import { MessageIcon } from "@/icons"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"

/**
 * TalkJS removed (WRDO-177) — dropped useUnreads(); the unread badge returns
 * with the WRDO conversation spine. Link to /user/messages preserved. (wrdo fork)
 */
export const MessageButton = () => {
  return (
    <LocalizedClientLink href="/user/messages" className="relative">
      <MessageIcon size={20} />
    </LocalizedClientLink>
  )
}
