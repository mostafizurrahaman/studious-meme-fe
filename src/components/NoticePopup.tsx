'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import noticeImage from '@/assets/notice.png';

const NOTICE_DISMISSED_KEY = 'malamal_notice_popup_dismissed';
const NOTICE_STORE_EVENT = 'malamal-notice-popup-change';

// subscribeToNoticeStore function
function subscribeToNoticeStore(onStoreChange: () => void) {
  addEventListener('storage', onStoreChange);
  addEventListener(NOTICE_STORE_EVENT, onStoreChange);

  return () => {
    removeEventListener('storage', onStoreChange);
    removeEventListener(NOTICE_STORE_EVENT, onStoreChange);
  };
}

// getNoticeSnapshot function
function getNoticeSnapshot() {
  return localStorage.getItem(NOTICE_DISMISSED_KEY) !== 'true';
}

// getServerNoticeSnapshot function
function getServerNoticeSnapshot() {
  return false;
}

// NoticePopup component
export function NoticePopup() {
  const open = useSyncExternalStore(
    subscribeToNoticeStore,
    getNoticeSnapshot,
    getServerNoticeSnapshot,
  );

  // closeNotice function
  function closeNotice() {
    localStorage.setItem(NOTICE_DISMISSED_KEY, 'true');
    dispatchEvent(new Event(NOTICE_STORE_EVENT));
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Notice"
    >
      <div className="relative w-[min(96vw,calc((100dvh-1.5rem)*0.8),900px)] overflow-hidden rounded-lg shadow-2xl sm:w-[min(90vw,calc((100dvh-3rem)*0.8),900px)]">
        <button
          type="button"
          onClick={closeNotice}
          className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close notice"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <Image
          src={noticeImage}
          alt="Notice"
          height={1350}
          width={1080}
          className="block h-auto w-full object-contain"
          priority
          sizes="(max-width: 640px) 96vw, (max-width: 1024px) 90vw, 900px"
        />
      </div>
    </div>
  );
}
