import React from 'react';
import { Bell, Calendar, CheckCheck, Megaphone, Newspaper, ShieldAlert, X } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { CampusNotification } from '../types/cms';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

function formatRelativeTime(ms?: number): string {
  if (!ms) return 'Just now';
  const diffMin = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function getNotificationMeta(type: CampusNotification['type']) {
  switch (type) {
    case 'urgent':
      return { label: 'Urgent Notice', Icon: ShieldAlert, accent: 'text-red-700' };
    case 'agenda':
      return { label: 'Campus Agenda', Icon: Calendar, accent: 'text-amber-700' };
    case 'news':
      return { label: 'Campus News', Icon: Newspaper, accent: 'text-[#0E5A36]' };
    default:
      return { label: 'Announcement', Icon: Megaphone, accent: 'text-[#0E5A36]' };
  }
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const { notifications, unreadNotificationCount, markAllNotificationsRead } = useCampus();
  const activeNotifications = notifications.filter((n) => n.active);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Campus Notifications">
      <div
        className="fixed inset-0 bg-[#0F1F18]/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-full max-w-md bg-white h-full border-l border-[#E2E8E2] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E2]">
          <div>
            <h2 className="text-lg font-semibold text-[#0F1F18]">Campus Notifications</h2>
            <p className="text-xs text-[#4A5D54] mt-0.5">
              Real-time announcements synchronized from the CMS
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="p-2 text-[#4A5D54] hover:text-[#0F1F18] hover:bg-[#F2F5F1] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {unreadNotificationCount > 0 && (
          <div className="px-6 py-2.5 bg-[#FAFBF9] border-b border-[#E2E8E2] flex items-center justify-between">
            <span className="text-xs font-medium text-[#0F1F18] tabular-nums">
              {unreadNotificationCount} unread update{unreadNotificationCount === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0E5A36] hover:underline cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8E2]">
          {activeNotifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="w-8 h-8 text-[#9BA9A1] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#0F1F18]">No active notifications</p>
              <p className="text-xs text-[#4A5D54] mt-1">
                New campus announcements and agenda updates will appear here immediately.
              </p>
            </div>
          ) : (
            activeNotifications.map((item) => {
              const { label, Icon, accent } = getNotificationMeta(item.type);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    markAllNotificationsRead();
                    onNavigateSection(item.targetSection || 'news');
                    onClose();
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-[#FAFBF9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${accent}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                    <span className="text-[#6B7D74] font-mono tabular-nums">
                      {formatRelativeTime(item.createdAtMs)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#0F1F18] leading-snug">
                    {item.title}
                  </div>
                  <p className="text-xs text-[#4A5D54] leading-relaxed mt-1">
                    {item.message}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export const LiveNotificationToast: React.FC<{
  onOpenDrawer: () => void;
}> = ({ onOpenDrawer }) => {
  const { latestLiveNotification, dismissLiveToast } = useCampus();
  if (!latestLiveNotification) return null;

  const { label, Icon, accent } = getNotificationMeta(latestLiveNotification.type);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-white border border-[#D4DDD6] rounded-xl shadow-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accent} mb-1`}>
            <Icon className="w-3.5 h-3.5" />
            New {label}
          </div>
          <div className="text-sm font-semibold text-[#0F1F18] leading-snug">
            {latestLiveNotification.title}
          </div>
          <p className="text-xs text-[#4A5D54] mt-1 line-clamp-2">
            {latestLiveNotification.message}
          </p>
          <button
            type="button"
            onClick={() => {
              dismissLiveToast();
              onOpenDrawer();
            }}
            className="mt-2.5 text-xs font-semibold text-[#0E5A36] hover:underline cursor-pointer"
          >
            View in Notification Center
          </button>
        </div>
        <button
          type="button"
          onClick={dismissLiveToast}
          aria-label="Dismiss notification"
          className="p-1 text-[#6B7D74] hover:text-[#0F1F18] rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
