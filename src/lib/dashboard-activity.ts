export type DashboardActivityAction = 'add' | 'remove' | 'update' | 'clear';

export type DashboardActivityUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
};

export type DashboardActivityProductSnapshot = {
  title: string;
  brand: string;
  category?: string;
  categorySlug?: string;
  image: string;
  sku: string;
  slug?: string;
  price?: number;
  stock?: number | null;
  rating?: number;
  oldPrice?: number;
  isFeatured?: boolean;
  weightKg?: number;
  isNoCOD?: boolean;
};

export type DashboardActivityRecord = {
  _id?: string;
  user?: DashboardActivityUser | string;
  product?: { _id?: string } | string | null;
  productSnapshot?: DashboardActivityProductSnapshot;
  action?: DashboardActivityAction;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardActivityCard = {
  id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userImage?: string;
  title: string;
  brand: string;
  sku: string;
  slug?: string;
  image: string;
  category?: string;
  categorySlug?: string;
  addedAt?: string;
  updatedAt?: string;
  removedAt?: string;
  clearedAt?: string;
  lastAction?: DashboardActivityAction;
  eventCount: number;
  quantity?: number;
  isActive: boolean;
  toneClass: string;
};

type GroupState = {
  card: DashboardActivityCard;
  sortAt: number;
};

const USER_TONES = [
  'bg-sky-50/80 border-sky-200/80 dark:bg-sky-950/20 dark:border-sky-900/60',
  'bg-emerald-50/80 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/60',
  'bg-violet-50/80 border-violet-200/80 dark:bg-violet-950/20 dark:border-violet-900/60',
  'bg-amber-50/80 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/60',
  'bg-rose-50/80 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-900/60',
  'bg-cyan-50/80 border-cyan-200/80 dark:bg-cyan-950/20 dark:border-cyan-900/60',
];

const getToneClass = (userKey: string) => {
  let hash = 0;

  for (let index = 0; index < userKey.length; index += 1) {
    hash = (hash * 31 + userKey.charCodeAt(index)) >>> 0;
  }

  return USER_TONES[hash % USER_TONES.length];
};

const toDate = (value?: string) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getUserLabel = (user?: DashboardActivityRecord['user']) => {
  if (!user) return { name: 'Unknown user', email: '-' };

  if (typeof user === 'string') {
    return { name: 'Unknown user', email: user };
  }

  return {
    name: user.name?.trim() || 'Unknown user',
    email: user.email?.trim() || '-',
  };
};

const getUserKey = (user?: DashboardActivityRecord['user']) => {
  if (!user) return 'user:unknown';
  if (typeof user === 'string') return `user:${user}`;
  return `user:${user._id ?? user.email ?? user.name ?? 'unknown'}`;
};

const getToneKey = (record: DashboardActivityRecord) =>
  getToneClass(getUserKey(record.user));

const getProductKey = (record: DashboardActivityRecord) => {
  const snapshot = record.productSnapshot;
  const product = record.product;

  if (!snapshot) {
    return `event:${record._id ?? record.createdAt ?? record.updatedAt ?? 'unknown'}`;
  }

  const productId = typeof product === 'string' ? product : product?._id;
  return `${productId ?? snapshot.sku ?? snapshot.slug ?? snapshot.title}`;
};

const getEventTime = (record: DashboardActivityRecord) => {
  return toDate(record.updatedAt ?? record.createdAt) ?? Date.now();
};

export function buildDashboardActivityCards(
  records: DashboardActivityRecord[],
): DashboardActivityCard[] {
  const groups = new Map<string, GroupState>();

  [...records]
    .sort((left, right) => getEventTime(left) - getEventTime(right))
    .forEach((record) => {
      const action = record.action ?? 'add';
      const eventTime = getEventTime(record);
      const user = getUserLabel(record.user);

      if (action === 'clear' || !record.productSnapshot) {
        const clearKey = `${getUserKey(record.user)}::clear::${record._id ?? eventTime}`;

        for (const state of groups.values()) {
          if (state.card.userEmail === user.email && state.card.isActive) {
            state.card.clearedAt = new Date(eventTime).toISOString();
            state.card.updatedAt = new Date(eventTime).toISOString();
            state.card.lastAction = 'clear';
            state.card.isActive = false;
            state.card.removedAt =
              state.card.removedAt ?? new Date(eventTime).toISOString();
          }
        }

        groups.set(clearKey, {
          card: {
            id: clearKey,
            userName: user.name,
            userEmail: user.email,
            userPhone:
              typeof record.user === 'object' ? record.user.phone : undefined,
            userImage:
              typeof record.user === 'object' ? record.user.image : undefined,
            title: 'Cart cleared',
            brand: 'Cart',
            sku: 'CLEAR',
            image: '/icon.png',
            addedAt:
              action === 'clear'
                ? new Date(eventTime).toISOString()
                : undefined,
            updatedAt: new Date(eventTime).toISOString(),
            removedAt: undefined,
            clearedAt: undefined,
            lastAction: 'clear',
            eventCount: 1,
            quantity: undefined,
            isActive: false,
            toneClass: getToneKey(record),
          },
          sortAt: eventTime,
        });
        return;
      }

      const key = `${getUserKey(record.user)}::${getProductKey(record)}`;
      const snapshot = record.productSnapshot;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          card: {
            id: key,
            userName: user.name,
            userEmail: user.email,
            userPhone:
              typeof record.user === 'object' ? record.user.phone : undefined,
            userImage:
              typeof record.user === 'object' ? record.user.image : undefined,
            title: snapshot.title,
            brand: snapshot.brand,
            sku: snapshot.sku,
            slug: snapshot.slug,
            image: snapshot.image,
            category: snapshot.category,
            categorySlug: snapshot.categorySlug,
            addedAt:
              action === 'add' ? new Date(eventTime).toISOString() : undefined,
            updatedAt: new Date(eventTime).toISOString(),
            removedAt:
              action === 'remove'
                ? new Date(eventTime).toISOString()
                : undefined,
            lastAction: action,
            eventCount: 1,
            quantity: record.quantity,
            isActive: action !== 'remove',
            toneClass: getToneKey(record),
          },
          sortAt: eventTime,
        });
        return;
      }

      const nextCard = { ...existing.card };
      nextCard.updatedAt = new Date(
        Math.max(existing.sortAt, eventTime),
      ).toISOString();
      nextCard.eventCount += 1;
      nextCard.lastAction = action;
      nextCard.isActive = action !== 'remove';
      nextCard.quantity =
        typeof record.quantity === 'number'
          ? record.quantity
          : nextCard.quantity;

      if (action === 'add' && !nextCard.addedAt) {
        nextCard.addedAt = new Date(eventTime).toISOString();
      }

      if (action === 'remove') {
        nextCard.removedAt = new Date(eventTime).toISOString();
        nextCard.clearedAt = nextCard.clearedAt ?? undefined;
      }

      if (action === 'update') {
        nextCard.updatedAt = new Date(eventTime).toISOString();
      }

      groups.set(key, {
        card: nextCard,
        sortAt: Math.max(existing.sortAt, eventTime),
      });
    });

  return [...groups.values()]
    .sort((a, b) => b.sortAt - a.sortAt)
    .map((entry) => entry.card);
}
