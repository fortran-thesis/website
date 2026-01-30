"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import EmptyState from './empty_state';

export type NotificationItem = {
  id: number | string;
  title: string;
  body: string;
  time: string;
};

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
};

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
}: NotificationsPanelProps) {
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
        aria-label="Reminders"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-black text-lg text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
            Reminders
          </h2>

          <button
            onClick={onClose}
            className="text-[var(--moldify-red)] text-xl leading-none hover:scale-110 transition cursor-pointer font-black"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 ? (
            <EmptyState
              icon={faBell}
              title="No Reminders"
              message="You're all caught up! Check back later for updates."
            />
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 bg-[var(--taupe)] rounded-xl px-4 py-3 shadow-sm"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <FontAwesomeIcon icon={faBell} className="text-[var(--accent-color)]" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--moldify-black)] mt-0.5 font-[family-name:var(--font-bricolage-grotesque)]">
                    {item.body}
                  </p>
                </div>

                {/* Time */}
                <span className="text-[10px] text-[var(--moldify-grey)] whitespace-nowrap mt-1 font-[family-name:var(--font-bricolage-grotesque)]">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
