"use client";

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import EmptyState from './empty_state';
import type { Notification } from '@/hooks/swr/use-notifications';
import { resolveNotificationRedirect } from '@/lib/redirect-resolver';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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

function getNotificationTimestamp(metadata?: Notification['metadata']): number {
  if (!metadata?.created_at) return 0;
  if (typeof metadata.created_at === 'object' && '_seconds' in metadata.created_at) {
    return metadata.created_at._seconds * 1000;
  }

  const timestamp = new Date(metadata.created_at as string).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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
  useBodyScrollLock(isOpen);

  const sortedNotifications = [...notifications].sort(
    (a, b) => getNotificationTimestamp(b.metadata) - getNotificationTimestamp(a.metadata)
  );
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
  className={`fixed inset-0 z-[120] transition-all duration-500 ease-in-out ${
    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  }`}
  aria-hidden={!isOpen}
>
  <div 
    className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500" 
    onClick={onClose} 
  />

  <aside
    className={`absolute right-0 top-0 h-full w-full max-w-lg 
    bg-[var(--background-color)] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    role="dialog"
    aria-modal="true"
  >
    {/* Header */}
    <div className="relative flex items-center justify-between px-10 py-12 border-b border-[var(--primary-color)]/5">
      <div className="space-y-1">
        <h2 className="font-black text-4xl text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter">
          Notification
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
            {unreadCount} New entries pending
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] hover:text-[var(--primary-color)] transition-colors cursor-pointer font-[family-name:var(--font-bricolage-grotesque)]"
          >
            Clear all
          </button>
        )}
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl bg-[var(--primary-color)] text-[var(--background-color)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--primary-color)]/20 cursor-pointer"
        >
          <span className="text-xl font-light">✕</span>
        </button>
      </div>
    </div>

    {/* Notifications List */}
    <div className="px-8 py-10 space-y-2 overflow-y-auto h-[calc(100%-160px)] custom-scrollbar">
      {notifications.length === 0 ? (
        <EmptyState
          icon={faBell}
          title="All Clear"
          message="No new updates in the observation log."
        />
      ) : (
        sortedNotifications.map((item) => (
          <div
            key={item.id}
            className={`group relative flex items-start gap-5 rounded-[2rem] p-6 transition-all duration-300 cursor-pointer border ${
              item.is_read
                ? 'bg-transparent border-transparent opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                : 'bg-[var(--primary-color)]/[0.04] border-[var(--primary-color)]/10'
            }`}
            onClick={() => handleNotificationClick(item)}
          >
            {/* Standard Icon Circle */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              item.is_read 
                ? 'bg-[var(--primary-color)]/5 text-[var(--primary-color)]/20' 
                : 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
            }`}>
              <FontAwesomeIcon icon={faBell} className="text-sm" />
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className={`text-sm font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tight truncate pr-4 ${
                  item.is_read ? 'text-[var(--moldify-grey)]' : 'text-[var(--primary-color)]'
                }`}>
                  {item.title}
                </p>
                <span className={`text-[9px] font-black font-[family-name:var(--font-bricolage-grotesque)] uppercase tracking-[0.1em] whitespace-nowrap mt-1 ${
                  item.is_read ? 'text-[var(--moldify-grey)]/30' : 'text-[var(--accent-color)]'
                }`}>
                  {formatTimeAgo(item.metadata)}
                </span>
              </div>
              
              <p className={`text-xs leading-relaxed font-[family-name:var(--font-bricolage-grotesque)] ${
                item.is_read ? 'text-[var(--moldify-grey)]' : 'text-[var(--moldify-black)] font-medium'
              }`}>
                {item.body}
              </p>

              {/* Functional Actions */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--primary-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                {onDelete && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-[var(--moldify-red)] hover:opacity-60 transition-all flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                    Dismiss
                  </button>
                )}
              </div>
            </div>

            {/* Unread Indicator Dot */}
            {!item.is_read && (
              <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] mt-2 flex-shrink-0" />
            )}
          </div>
        ))
      )}
    </div>
  </aside>
</div>
  );
}
