'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DashboardInput } from '@/components/dashboard/DashboardInput';
import { FileUpload } from '@/components/ui/file-upload';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';
import {
  BackendHeroBanner,
  BackendHeroSection,
  createHeroBanner,
  deleteHeroBanner,
  reorderHeroBanners,
  updateHeroBanner,
  updateHeroBannerStatus,
} from '@/services/HeroSection';
import { cn } from '@/lib/utils';

const bannerFormSchema = z.object({
  title: z
    .string({ error: 'Title is required!' })
    .trim()
    .min(1, { message: 'Title is required!' }),
  description: z.string().trim().optional(),
  imageAlt: z
    .string({ error: 'Image alt is required!' })
    .trim()
    .min(1, { message: 'Image alt is required!' }),
  clickUrl: z
    .string({ error: 'Click URL is required!' })
    .trim()
    .min(1, { message: 'Click URL is required!' }),
  slot: z.enum(['SLIDE', 'FEATURE']),
  isActive: z.boolean(),
});

type BannerFormData = {
  title: string;
  description: string;
  image: string | File | null;
  imageAlt: string;
  clickUrl: string;
  slot: 'SLIDE' | 'FEATURE';
  order: number;
  isActive: boolean;
};

const emptyFormData: BannerFormData = {
  title: '',
  description: '',
  image: null,
  imageAlt: '',
  clickUrl: '/shop',
  slot: 'SLIDE',
  order: 0,
  isActive: true,
};

type Props = {
  initialBanners?: BackendHeroBanner[];
  heroes?: BackendHeroSection[];
};

export function DashboardHeroManager({ initialBanners, heroes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize banners from initialBanners or fallback legacy heroes
  const [banners, setBanners] = useState<BackendHeroBanner[]>(() => {
    if (initialBanners && initialBanners.length > 0) {
      return initialBanners;
    }
    if (heroes && heroes.length > 0) {
      const legacy = heroes[0];
      const converted: BackendHeroBanner[] = [];
      (legacy.slides || []).forEach((slide, index) => {
        converted.push({
          _id: slide._id || `legacy-slide-${index}`,
          title: slide.title,
          description: slide.description,
          image: slide.image,
          imageAlt: slide.imageAlt || slide.title,
          clickUrl: slide.clickUrl,
          slot: 'SLIDE',
          order: index,
          isActive: legacy.isActive ?? true,
        });
      });
      (legacy.features || []).forEach((feature, index) => {
        converted.push({
          _id: feature._id || `legacy-feature-${index}`,
          title: feature.title,
          description: feature.description,
          image: feature.image,
          imageAlt: feature.imageAlt || feature.title,
          clickUrl: feature.clickUrl,
          slot: 'FEATURE',
          order: index,
          isActive: legacy.isActive ?? true,
        });
      });
      return converted;
    }
    return [];
  });

  const [activeSlotFilter, setActiveSlotFilter] = useState<
    'ALL' | 'SLIDE' | 'FEATURE'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingDeleteBanner, setPendingDeleteBanner] =
    useState<BackendHeroBanner | null>(null);

  // Computed summary counts
  const slideCount = useMemo(
    () => banners.filter((b) => b.slot === 'SLIDE').length,
    [banners],
  );
  const featureCount = useMemo(
    () => banners.filter((b) => b.slot === 'FEATURE').length,
    [banners],
  );
  const activeCount = useMemo(
    () => banners.filter((b) => b.isActive).length,
    [banners],
  );

  // Filtered & sorted banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        if (activeSlotFilter !== 'ALL' && b.slot !== activeSlotFilter)
          return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.clickUrl.toLowerCase().includes(q) ||
          b.imageAlt.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.slot !== b.slot) return a.slot === 'SLIDE' ? -1 : 1;
        return a.order - b.order;
      });
  }, [banners, activeSlotFilter, searchQuery]);

  function openCreateModal(defaultSlot?: 'SLIDE' | 'FEATURE') {
    const slot =
      defaultSlot || (activeSlotFilter === 'FEATURE' ? 'FEATURE' : 'SLIDE');
    const slotBanners = banners.filter((b) => b.slot === slot);
    const nextOrder =
      slotBanners.length > 0
        ? Math.max(...slotBanners.map((b) => b.order)) + 1
        : 0;

    setEditingBannerId(null);
    setFormData({
      ...emptyFormData,
      slot,
      order: nextOrder,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  }

  function openEditModal(banner: BackendHeroBanner) {
    setEditingBannerId(banner._id);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image: banner.image,
      imageAlt: banner.imageAlt,
      clickUrl: banner.clickUrl,
      slot: banner.slot,
      order: banner.order,
      isActive: banner.isActive,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  }

  function handleSaveBanner() {
    const parsed = bannerFormSchema.safeParse(formData);
    const errors: Record<string, string> = {};

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
    }

    if (!formData.image) {
      errors.image = 'Banner image is required!';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    startTransition(async () => {
      try {
        if (editingBannerId) {
          // Update
          const res = await updateHeroBanner(editingBannerId, {
            title: formData.title,
            description: formData.description,
            image: formData.image,
            imageAlt: formData.imageAlt,
            clickUrl: formData.clickUrl,
            slot: formData.slot,
            order: formData.order,
            isActive: formData.isActive,
          });

          if (!res?.success) {
            toast.error(res?.message || 'Failed to update hero banner.');
            return;
          }

          toast.success(res?.message || 'Hero banner updated successfully!');
          setBanners((prev) =>
            prev.map((b) =>
              b._id === editingBannerId && res.data ? res.data : b,
            ),
          );
        } else {
          // Create
          const res = await createHeroBanner({
            title: formData.title,
            description: formData.description,
            image: formData.image,
            imageAlt: formData.imageAlt,
            clickUrl: formData.clickUrl,
            slot: formData.slot,
            order: formData.order,
            isActive: formData.isActive,
          });

          if (!res?.success) {
            toast.error(res?.message || 'Failed to create hero banner.');
            return;
          }

          toast.success(res?.message || 'Hero banner created successfully!');
          if (res.data) {
            setBanners((prev) => [...prev, res.data as BackendHeroBanner]);
          }
        }

        setIsDialogOpen(false);
        router.refresh();
      } catch {
        toast.error('An unexpected error occurred while saving banner.');
      }
    });
  }

  function handleToggleStatus(banner: BackendHeroBanner, nextState: boolean) {
    setBanners((prev) =>
      prev.map((b) =>
        b._id === banner._id ? { ...b, isActive: nextState } : b,
      ),
    );

    startTransition(async () => {
      const res = await updateHeroBannerStatus(banner._id, nextState);
      if (!res?.success) {
        setBanners((prev) =>
          prev.map((b) =>
            b._id === banner._id ? { ...b, isActive: banner.isActive } : b,
          ),
        );
        toast.error(res?.message || 'Failed to toggle banner status.');
        return;
      }
      toast.success(
        nextState
          ? `"${banner.title}" is now active on storefront!`
          : `"${banner.title}" is now hidden.`,
      );
      router.refresh();
    });
  }

  function handleMoveOrder(
    banner: BackendHeroBanner,
    direction: 'up' | 'down',
  ) {
    const slotItems = banners
      .filter((b) => b.slot === banner.slot)
      .sort((a, b) => a.order - b.order);

    const currentIndex = slotItems.findIndex((b) => b._id === banner._id);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= slotItems.length) return;

    const targetBanner = slotItems[targetIndex];
    const currentOrder = banner.order;
    const targetOrder = targetBanner.order;

    const newCurrentOrder =
      currentOrder === targetOrder
        ? direction === 'up'
          ? targetOrder - 1
          : targetOrder + 1
        : targetOrder;
    const newTargetOrder = currentOrder;

    setBanners((prev) =>
      prev.map((b) => {
        if (b._id === banner._id) return { ...b, order: newCurrentOrder };
        if (b._id === targetBanner._id)
          return { ...b, order: newTargetOrder };
        return b;
      }),
    );

    startTransition(async () => {
      const res = await reorderHeroBanners([
        { id: banner._id, order: newCurrentOrder },
        { id: targetBanner._id, order: newTargetOrder },
      ]);

      if (!res?.success) {
        setBanners((prev) =>
          prev.map((b) => {
            if (b._id === banner._id) return { ...b, order: currentOrder };
            if (b._id === targetBanner._id)
              return { ...b, order: targetOrder };
            return b;
          }),
        );
        toast.error(res?.message || 'Failed to reorder banners.');
        return;
      }

      toast.success('Banners reordered successfully!');
      router.refresh();
    });
  }

  function handleDeleteBanner() {
    if (!pendingDeleteBanner) return;
    const bannerId = pendingDeleteBanner._id;

    startTransition(async () => {
      const res = await deleteHeroBanner(bannerId);
      if (!res?.success) {
        toast.error(res?.message || 'Failed to delete banner.');
        return;
      }

      setBanners((prev) => prev.filter((b) => b._id !== bannerId));
      setPendingDeleteBanner(null);
      toast.success('Hero banner deleted successfully!');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Hero Section Banners
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold uppercase tracking-wider"
            >
              Atomic
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage carousel banners and side promo cards independently with
            instant live sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted"
          >
            <Eye className="size-3.5 text-muted-foreground" />
            <span>Storefront</span>
          </Link>

          <Button
            type="button"
            onClick={() => openCreateModal()}
            className="h-9 gap-2 rounded-xl px-4 text-xs font-semibold shadow-sm"
          >
            <Plus className="size-4" />
            Add New Banner
          </Button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs transition hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Carousel Slides
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">
                {slideCount}
              </span>
              <span className="text-xs text-muted-foreground">
                active in rotation
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Main rotating hero banner on desktop & mobile
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs transition hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Side Promo Features
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
              <LayoutGrid className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">
                {featureCount}
              </span>
              <span className="text-xs text-muted-foreground">
                cards configured
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/80">
              High-visibility promotional tiles beside the slider
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs transition hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Storefront Status
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">
                {activeCount}
              </span>
              <span className="text-xs text-muted-foreground">
                of {banners.length} visible
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Real-time published banners visible to shoppers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          <Button
            type="button"
            variant={activeSlotFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSlotFilter('ALL')}
            className={cn(
              'h-8 rounded-lg px-3 text-xs font-semibold',
              activeSlotFilter === 'ALL'
                ? 'shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All Banners ({banners.length})
          </Button>

          <Button
            type="button"
            variant={activeSlotFilter === 'SLIDE' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSlotFilter('SLIDE')}
            className={cn(
              'h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold',
              activeSlotFilter === 'SLIDE'
                ? 'shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            Carousel Slides ({slideCount})
          </Button>

          <Button
            type="button"
            variant={activeSlotFilter === 'FEATURE' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSlotFilter('FEATURE')}
            className={cn(
              'h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold',
              activeSlotFilter === 'FEATURE'
                ? 'shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="size-2 rounded-full bg-amber-500" />
            Side Features ({featureCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <DashboardInput
            placeholder="Search by title, alt or link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 text-xs"
          />
        </div>
      </div>

      {/* 4. Banner List Cards */}
      <div className="space-y-3">
        {filteredBanners.length === 0 ? (
          <Card className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground">
              <ImageIcon className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              No hero banners found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {searchQuery
                ? 'No banners matched your search query. Try searching for something else.'
                : 'Get started by creating your first promotional banner.'}
            </p>
            <Button
              type="button"
              onClick={() => openCreateModal()}
              className="mt-5 gap-2 rounded-xl text-xs font-semibold"
            >
              <Plus className="size-4" />
              Add Banner
            </Button>
          </Card>
        ) : (
          filteredBanners.map((banner) => {
            const isSlide = banner.slot === 'SLIDE';
            return (
              <Card
                key={banner._id}
                className={cn(
                  'group overflow-hidden rounded-2xl border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md',
                  !banner.isActive && 'opacity-70 bg-card/60',
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Thumbnail Preview & Meta */}
                  <div className="flex flex-1 items-start gap-4 min-w-0">
                    <div className="relative h-24 w-36 sm:h-28 sm:w-48 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                      {banner.image ? (
                        <Image
                          src={banner.image}
                          alt={banner.imageAlt || banner.title}
                          fill
                          unoptimized
                          sizes="200px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="size-6" />
                        </div>
                      )}

                      <div className="absolute left-2 top-2">
                        <Badge
                          variant={isSlide ? 'default' : 'secondary'}
                          className="text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs"
                        >
                          {isSlide ? 'Slide' : 'Feature'}
                        </Badge>
                      </div>

                      <div className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        #{banner.order}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Order Priority: #{banner.order}
                        </span>

                        {!banner.isActive ? (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 text-[10px] font-semibold"
                          >
                            <EyeOff className="size-3" />
                            Hidden / Inactive
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-5 gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="size-3" />
                            Active on Storefront
                          </Badge>
                        )}
                      </div>

                      <h3 className="truncate text-base font-bold text-foreground sm:text-lg">
                        {banner.title}
                      </h3>

                      {banner.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {banner.description}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <Link
                          href={banner.clickUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="size-3" />
                          <span className="max-w-[220px] truncate">
                            {banner.clickUrl}
                          </span>
                        </Link>
                        <span>•</span>
                        <span className="truncate max-w-[180px]">
                          Alt: {banner.imageAlt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 sm:border-t-0 sm:pt-0">
                    {/* Live Switch */}
                    <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5">
                      <span className="text-xs font-semibold">
                        {banner.isActive ? 'Live' : 'Hidden'}
                      </span>
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleStatus(banner, checked)
                        }
                        disabled={isPending}
                        aria-label="Toggle banner visibility"
                      />
                    </div>

                    {/* Order buttons */}
                    <div className="flex items-center rounded-xl border border-border bg-card">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none hover:bg-muted"
                        onClick={() => handleMoveOrder(banner, 'up')}
                        disabled={isPending}
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none border-l border-border hover:bg-muted"
                        onClick={() => handleMoveOrder(banner, 'down')}
                        disabled={isPending}
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>

                    {/* Edit button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(banner)}
                      disabled={isPending}
                      className="h-8 gap-1.5 rounded-xl text-xs font-semibold"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingDeleteBanner(banner)}
                      disabled={isPending}
                      className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete banner"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 5. Create / Edit Dialog (Completely fixed centering, styling & responsiveness) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Dialog Header */}
          <DialogHeader className="border-b border-border/80 px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {editingBannerId ? (
                  <Pencil className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {editingBannerId ? 'Edit Hero Banner' : 'Create Hero Banner'}
              </DialogTitle>
            </div>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              {editingBannerId
                ? 'Update copy, destination links, or upload a replacement creative.'
                : 'Add a new banner to the homepage carousel or promotional side feature grid.'}
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* 1. Placement Slot & Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Placement Slot *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, slot: 'SLIDE' })}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition',
                      formData.slot === 'SLIDE'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Sparkles className="size-4" />
                    <span className="text-xs">Carousel Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, slot: 'FEATURE' })}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition',
                      formData.slot === 'FEATURE'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <LayoutGrid className="size-4" />
                    <span className="text-xs">Side Feature</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Storefront Visibility
                </label>
                <div className="flex h-14 items-center justify-between rounded-xl border border-border bg-muted/20 px-3.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      {formData.isActive ? 'Active / Visible' : 'Hidden / Draft'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formData.isActive
                        ? 'Visible to live shoppers'
                        : 'Only visible in dashboard'}
                    </span>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2. Banner Title & Alt Text */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Banner Title *
                </label>
                <DashboardInput
                  placeholder="e.g. Heavy Duty Power Tools"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                {formErrors.title && (
                  <p className="text-xs font-medium text-destructive">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Image Alt Text (SEO) *
                </label>
                <DashboardInput
                  placeholder="e.g. Cordless Impact Drill Sale"
                  value={formData.imageAlt}
                  onChange={(e) =>
                    setFormData({ ...formData, imageAlt: e.target.value })
                  }
                />
                {formErrors.imageAlt && (
                  <p className="text-xs font-medium text-destructive">
                    {formErrors.imageAlt}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Click URL Link & Order Index */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Click URL Link *
                </label>
                <DashboardInput
                  placeholder="e.g. /shop?category=power-tools"
                  value={formData.clickUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, clickUrl: e.target.value })
                  }
                />
                {formErrors.clickUrl && (
                  <p className="text-xs font-medium text-destructive">
                    {formErrors.clickUrl}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Index
                </label>
                <DashboardInput
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* 4. Description / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Subtitle / Promotional Text (Optional)
              </label>
              <DashboardInput
                placeholder="e.g. Top tier brands with certified manufacturer warranties"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* 5. Banner Creative / Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Banner Image Creative *
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {formData.slot === 'SLIDE'
                    ? 'Recommended: 1920×800 or 16:9'
                    : 'Recommended: 800×600 or 4:3'}
                </span>
              </div>

              <FileUpload
                value={formData.image}
                onChange={(fileOrUrl) =>
                  setFormData({ ...formData, image: fileOrUrl })
                }
                placeholder="Paste image URL or choose file"
              />

              {formErrors.image && (
                <p className="text-xs font-medium text-destructive">
                  {formErrors.image}
                </p>
              )}
            </div>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="border-t border-border/80 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveBanner}
              disabled={isPending}
              className="gap-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {editingBannerId ? 'Save Changes' : 'Publish Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteBanner)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteBanner(null);
        }}
        onConfirm={handleDeleteBanner}
        isPending={isPending}
        title="Delete Banner"
        description={`Are you sure you want to permanently delete "${pendingDeleteBanner?.title}"? Its image asset will be removed from storage.`}
        confirmLabel="Delete Banner"
      />
    </div>
  );
}
