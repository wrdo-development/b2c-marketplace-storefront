'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { SpineAction, SpineMessage } from './types';

interface MessageListProps {
  messages: SpineMessage[];
  /** Tap handler for a wrdo action button. */
  onAction: (action: SpineAction) => void;
  /** Gentle empty-state copy (e.g. while a session is being established). */
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Shared message-list rendering for the WRDO spine (ChatBox + the messages
 * inbox both use this). User bubbles right-aligned, wrdo bubbles left-aligned;
 * wrdo action buttons render under their message. Auto-scrolls to the latest.
 */
export function MessageList({
  messages,
  onAction,
  emptyState,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (messages.length === 0 && emptyState) {
    return (
      <div
        className={cn(
          'flex flex-1 items-center justify-center text-center text-sm text-secondary px-4',
          className
        )}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-1 flex-col gap-3 overflow-y-auto p-4', className)}
      data-testid="spine-message-list"
    >
      {messages.map((message) => {
        const isUser = message.sender === 'user';
        return (
          <div
            key={message.id}
            className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-sm px-4 py-2 text-md whitespace-pre-wrap break-words',
                isUser
                  ? 'bg-action text-action-on-primary'
                  : 'bg-component-secondary text-primary',
                message.pending && 'opacity-60'
              )}
            >
              {message.text}
            </div>

            {!isUser && message.actions && message.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onAction(action)}
                    className="rounded-sm border border-primary bg-primary px-3 py-1 text-sm text-primary transition-colors hover:bg-action-secondary-hover active:bg-action-secondary-pressed"
                    data-testid={`spine-action-${action.id}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
