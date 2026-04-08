"use client";

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faCheckDouble, faTrash } from '@fortawesome/free-solid-svg-icons';
import EmptyState from './empty_state';
import type { Notification } from '@/hooks/swr/use-notifications';
import { resolveNotificationRedirect } from '@/lib/redirect-resolver';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTimeAgo(metadata?: Notification['metadata']): string {
  if (!metadata?.created_at) return '';
  let ms: number;
  if (typeof metadata.created_at === 'object' && '_seconds' in metadata.created_at) {
    ms = metadata.created_at._seconds * 1000;
  } else {
    ms = new Date(metadata.created_at as string).getTime();
  }
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
};

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationsPanelProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read && onMarkRead) {
      onMarkRead(notification.id);
    }

    const href = resolveNotificationRedirect(notification.reference_type, notification.reference_id);
    if (href) router.push(href);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md 
        bg-[var(--background-color)] shadow-2xl transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-black text-lg text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
            Notifications
          </h2>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-bold text-[var(--moldify-blue)] hover:underline cursor-pointer font-[family-name:var(--font-bricolage-grotesque)]"
                aria-label="Mark all as read"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="mr-1" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[var(--moldify-red)] text-xl leading-none hover:scale-110 transition cursor-pointer font-black"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 ? (
            <EmptyState
              icon={faBell}
              title="No Notifications"
              message="You're all caught up! Check back later for updates."
            />
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-sm transition cursor-pointer hover:shadow-md ${
                  item.is_read
                    ? 'bg-[var(--taupe)] hover:bg-[var(--taupe)]/80'
                    : 'bg-[var(--moldify-blue)]/10 border-l-4 border-[var(--moldify-blue)] hover:bg-[var(--moldify-blue)]/20'
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <FontAwesomeIcon
                    icon={faBell}
                    className={item.is_read ? 'text-[var(--accent-color)]' : 'text-[var(--moldify-blue)]'}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--moldify-black)] mt-0.5 font-[family-name:var(--font-bricolage-grotesque)]">
                    {item.body}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2">
                    {!item.is_read && onMarkRead && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onMarkRead(item.id);
                        }}
                        className="text-[10px] font-bold text-[var(--moldify-blue)] hover:underline cursor-pointer font-[family-name:var(--font-bricolage-grotesque)]"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-0.5" />
                        Mark read
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="text-[10px] font-bold text-[var(--moldify-red)] hover:underline cursor-pointer font-[family-name:var(--font-bricolage-grotesque)]"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-0.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Time */}
                <span className="text-[10px] text-[var(--moldify-grey)] whitespace-nowrap mt-1 font-[family-name:var(--font-bricolage-grotesque)]">
                  {formatTimeAgo(item.metadata)}
                </span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
