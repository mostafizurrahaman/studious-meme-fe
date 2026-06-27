'use client';

import {
  MessageCircleMore,
  MessageSquare,
  PhoneCall,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

type ContactAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  className: string;
};

const messengerHref = 'https://m.me/malamalxyz';
const whatsappHref = 'https://wa.me/+8801972525821';
const hotlineHref = 'tel:+8801972525821';

const BUTTON_SIZE = 56;
const EDGE_MARGIN = 12;
const RIGHT_GAP = 12;
const BOTTOM_GAP = 112;
const DRAG_THRESHOLD = 6;
const WINDOW_SIZE_FALLBACK = '0x0';

function clamp(value: number, min: number, max: number) {
  if (max < min) return value;
  return Math.min(Math.max(value, min), max);
}

function subscribeWindowSize(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getWindowSizeSnapshot(): string {
  return `${window.innerWidth}x${window.innerHeight}`;
}

function getServerWindowSizeSnapshot(): string {
  return WINDOW_SIZE_FALLBACK;
}

function useWindowSize() {
  const snapshot = useSyncExternalStore(
    subscribeWindowSize,
    getWindowSizeSnapshot,
    getServerWindowSizeSnapshot,
  );
  const [width, height] = snapshot.split('x').map(Number);

  return {
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0,
  };
}

function FloatingLabel({
  children,
  side,
}: {
  children: ReactNode;
  side: 'left' | 'right';
}) {
  return (
    <span
      className={`pointer-events-none absolute ${
        side === 'left' ? 'right-full mr-3' : 'left-full ml-3'
      } inline-flex translate-x-2 items-center rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground opacity-0 shadow-[0_10px_25px_rgba(15,23,42,0.12)] transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100`}
    >
      {children}
    </span>
  );
}

export function FloatingContactWidget() {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const viewport = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    dragging: false,
  });

  const actions: ContactAction[] = [
    {
      label: 'WhatsApp',
      href: whatsappHref,
      icon: MessageCircleMore,
      className:
        'bg-[#25D366] text-white shadow-[0_10px_20px_rgba(37,211,102,0.28)]',
    },
    {
      label: 'Messenger',
      href: messengerHref,
      icon: MessageSquare,
      className:
        'bg-[#0084FF] text-white shadow-[0_10px_20px_rgba(0,132,255,0.22)]',
    },
    {
      label: 'Call',
      href: hotlineHref,
      icon: PhoneCall,
      className:
        'bg-sky-500 text-white shadow-[0_10px_20px_rgba(14,165,233,0.22)]',
    },
  ];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function clampOffset(
    nextOffset: { x: number; y: number },
    width: number,
    height: number,
  ) {
    if (!width || !height) return nextOffset;

    const baseLeft = width - RIGHT_GAP - BUTTON_SIZE;
    const baseTop = height - BOTTOM_GAP - BUTTON_SIZE;

    const minX = EDGE_MARGIN - baseLeft;
    const maxX = RIGHT_GAP - EDGE_MARGIN;
    const minY = EDGE_MARGIN - baseTop;
    const maxY = BOTTOM_GAP - EDGE_MARGIN;

    return {
      x: clamp(nextOffset.x, minX, maxX),
      y: clamp(nextOffset.y, minY, maxY),
    };
  }

  const clampedOffset = clampOffset(offset, viewport.width, viewport.height);
  const actualLeft = viewport.width
    ? viewport.width - RIGHT_GAP - BUTTON_SIZE + clampedOffset.x
    : 0;
  const actualTop = viewport.height
    ? viewport.height - BOTTOM_GAP - BUTTON_SIZE + clampedOffset.y
    : 0;
  const labelSide: 'left' | 'right' =
    viewport.width && actualLeft + BUTTON_SIZE / 2 < viewport.width / 2
      ? 'right'
      : 'left';
  const stackDirection: 'up' | 'down' =
    viewport.height && actualTop + BUTTON_SIZE / 2 < viewport.height / 2
      ? 'down'
      : 'up';

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
      dragging: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    if (
      !dragRef.current.dragging &&
      Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD
    ) {
      dragRef.current.dragging = true;
      setOpen(false);
    }

    if (!dragRef.current.dragging) return;

    setOffset(
      clampOffset(
        {
          x: dragRef.current.startOffsetX + deltaX,
          y: dragRef.current.startOffsetY + deltaY,
        },
        viewport.width,
        viewport.height,
      ),
    );
  };

  const resetDragState = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    const wasDragging = dragRef.current.dragging;

    dragRef.current = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      dragging: false,
    };

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!wasDragging) {
      setOpen((value) => !value);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed right-3 bottom-28 z-50 sm:right-6 sm:bottom-6 lg:right-8"
    >
      <div
        className="relative h-14 w-14"
        style={{
          transform: `translate3d(${clampedOffset.x}px, ${clampedOffset.y}px, 0)`,
          touchAction: 'none',
          willChange: 'transform',
        }}
      >
        <div
          className={`absolute flex flex-col gap-3 transition-all duration-300 ease-out motion-reduce:transition-none ${
            open
              ? 'pointer-events-auto scale-100 translate-y-0 opacity-100'
              : 'pointer-events-none scale-95 translate-y-2 opacity-0'
          } ${stackDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} ${
            labelSide === 'left' ? 'items-end right-0' : 'items-start left-0'
          }`}
        >
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                key={action.label}
                className="group relative flex items-center"
              >
                <FloatingLabel side={labelSide}>{action.label}</FloatingLabel>
                <a
                  href={action.href}
                  target={action.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    action.href.startsWith('http') ? 'noreferrer' : undefined
                  }
                  aria-label={action.label}
                  onClick={() => setOpen(false)}
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/80 transition-transform duration-200 ease-out hover:scale-105 ${action.className}`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </a>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={resetDragState}
          onPointerCancel={resetDragState}
          aria-expanded={open}
          aria-label={open ? 'Hide contact actions' : 'Open contact actions'}
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/80 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:scale-105 motion-reduce:transition-none ${
            open ? 'bg-[#8dcf8f]' : 'bg-[#6fd58b]'
          }`}
        >
          <span
            className={`transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}
          >
            {open ? (
              <X className="h-7 w-7 text-white" />
            ) : (
              <MessageCircleMore className="h-7 w-7 text-white" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
