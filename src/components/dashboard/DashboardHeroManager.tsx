'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardInput } from '@/components/dashboard/DashboardInput';
import { FileUpload } from '@/components/ui/file-upload';
import { cn } from '@/lib/utils';
import {
  createHeroSection,
  deleteHeroSection,
  type BackendHeroSection,
  updateHeroSection,
} from '@/services/HeroSection';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';

const heroCardSchema = z.object({
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  imageAlt: z
    .string({ error: 'Image alt is required!' })
    .trim()
    .min(1, { message: 'Image alt is required!' }),
  title: z
    .string({ error: 'Title is required!' })
    .trim()
    .min(1, { message: 'Title is required!' }),
  description: z
    .string({ error: 'Description is required!' })
    .trim()
    .min(1, { message: 'Description is required!' }),
  clickUrl: z
    .string({ error: 'Click URL is required!' })
    .trim()
    .min(1, { message: 'Click URL is required!' }),
});

const heroSectionSchema = z.object({
  slides: z
    .array(heroCardSchema)
    .min(1, { message: 'At least one slide is required!' }),
  features: z
    .array(heroCardSchema)
    .min(1, { message: 'At least one feature is required!' }),
  isActive: z.boolean(),
});

type HeroCardErrors = Partial<
  Record<'image' | 'imageAlt' | 'title' | 'description' | 'clickUrl', string>
>;

type HeroSectionErrors = {
  slides: HeroCardErrors[];
  features: HeroCardErrors[];
};

type HeroCardForm = ReturnType<typeof emptyCard>;

function emptyCard() {
  return {
    image: null as string | File | null,
    imageAlt: '',
    title: '',
    description: '',
    clickUrl: '',
  };
}

function emptyHero() {
  return { slides: [emptyCard()], features: [emptyCard()], isActive: true };
}

function emptyErrors(): HeroSectionErrors {
  return { slides: [], features: [] };
}

function toErrors(cards: HeroCardForm[]): HeroCardErrors[] {
  return cards.map((card) => {
    const parsed = heroCardSchema.safeParse(card);
    if (parsed.success) return {};

    return parsed.error.issues.reduce<HeroCardErrors>((acc, issue) => {
      const key = issue.path[0];
      if (
        key === 'image' ||
        key === 'imageAlt' ||
        key === 'title' ||
        key === 'description' ||
        key === 'clickUrl'
      ) {
        acc[key] = issue.message;
      }
      return acc;
    }, {});
  });
}

function validateHeroSection(form: ReturnType<typeof emptyHero>) {
  const parsed = heroSectionSchema.safeParse(form);

  if (parsed.success) {
    return { ok: true as const, errors: emptyErrors() };
  }

  return {
    ok: false as const,
    errors: {
      slides: toErrors(form.slides),
      features: toErrors(form.features),
    },
  };
}

function validateCard(card: HeroCardForm): HeroCardErrors {
  const parsed = heroCardSchema.safeParse(card);

  if (parsed.success) {
    return {};
  }

  return parsed.error.issues.reduce<HeroCardErrors>((acc, issue) => {
    const key = issue.path[0];
    if (
      key === 'image' ||
      key === 'imageAlt' ||
      key === 'title' ||
      key === 'description' ||
      key === 'clickUrl'
    ) {
      acc[key] = issue.message;
    }
    return acc;
  }, {});
}

function setCardErrorAt(
  errors: HeroCardErrors[],
  index: number,
  nextCard: HeroCardForm,
  setErrors: (errors: HeroCardErrors[]) => void,
) {
  const nextErrors = [...errors];
  nextErrors[index] = validateCard(nextCard);
  setErrors(nextErrors);
}

function updateCardField(
  cards: HeroCardForm[],
  errors: HeroCardErrors[],
  index: number,
  nextCard: HeroCardForm,
  setCards: (cards: HeroCardForm[]) => void,
  setErrors: (errors: HeroCardErrors[]) => void,
) {
  setCards(
    cards.map((item, currentIndex) =>
      currentIndex === index ? nextCard : item,
    ),
  );
  setCardErrorAt(errors, index, nextCard, setErrors);
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

export function DashboardHeroManager({
  heroes,
}: {
  heroes: BackendHeroSection[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyHero());
  const [formErrors, setFormErrors] =
    useState<HeroSectionErrors>(emptyErrors());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState(emptyHero());
  const [editingErrors, setEditingErrors] =
    useState<HeroSectionErrors>(emptyErrors());
  const [pendingDeleteHero, setPendingDeleteHero] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [heroRows, setHeroRows] = useState(heroes);
  const rows = useMemo(() => heroRows.slice(0, 10), [heroRows]);
  const hasExistingHero = rows.length > 0;

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.refresh();
  }

  function closeDeleteDialog() {
    if (isPending) return;
    setPendingDeleteHero(null);
  }

  function confirmDeleteHero() {
    const heroId = pendingDeleteHero?.id;
    if (!heroId) return;

    startTransition(async () => {
      const result = await deleteHeroSection(heroId);
      if (!result?.success)
        return refresh(
          result?.message ?? 'Failed to delete hero section.',
          'error',
        );
      setHeroRows((current) => current.filter((hero) => hero._id !== heroId));
      setPendingDeleteHero(null);
      refresh(
        result.message ?? 'Hero section deleted successfully.',
        'success',
      );
    });
  }

  const renderCards = (
    cards: HeroCardForm[],
    errors: HeroCardErrors[],
    setCards: (cards: HeroCardForm[]) => void,
    setErrors: (errors: HeroCardErrors[]) => void,
    onAddCard: () => void,
    tone: 'slides' | 'features',
    label: string,
  ) => (
    <div className="space-y-3">
      <div className="text-sm font-semibold">{label}</div>
      {cards.map((card, index) => (
        <div
          key={`${label}-${index}`}
          className={cn(
            'rounded-2xl border p-4 shadow-sm',
            tone === 'slides'
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-amber-200 bg-amber-50/70',
          )}
        >
          <div className="grid items-start gap-5 xl:grid-cols-2">
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <DashboardInput
                    placeholder="Image alt"
                    value={card.imageAlt}
                    onChange={(e) =>
                      updateCardField(
                        cards,
                        errors,
                        index,
                        { ...card, imageAlt: e.target.value },
                        setCards,
                        setErrors,
                      )
                    }
                    onBlur={(e) =>
                      setCardErrorAt(
                        errors,
                        index,
                        { ...card, imageAlt: e.target.value },
                        setErrors,
                      )
                    }
                  />
                  <ErrorText message={errors[index]?.imageAlt} />
                </div>
                <div className="space-y-1">
                  <DashboardInput
                    placeholder="Title"
                    value={card.title}
                    onChange={(e) =>
                      updateCardField(
                        cards,
                        errors,
                        index,
                        { ...card, title: e.target.value },
                        setCards,
                        setErrors,
                      )
                    }
                    onBlur={(e) =>
                      setCardErrorAt(
                        errors,
                        index,
                        { ...card, title: e.target.value },
                        setErrors,
                      )
                    }
                  />
                  <ErrorText message={errors[index]?.title} />
                </div>
                <div className="space-y-1">
                  <DashboardInput
                    placeholder="Description"
                    value={card.description}
                    onChange={(e) =>
                      updateCardField(
                        cards,
                        errors,
                        index,
                        { ...card, description: e.target.value },
                        setCards,
                        setErrors,
                      )
                    }
                    onBlur={(e) =>
                      setCardErrorAt(
                        errors,
                        index,
                        { ...card, description: e.target.value },
                        setErrors,
                      )
                    }
                  />
                  <ErrorText message={errors[index]?.description} />
                </div>
                <div className="space-y-1">
                  <DashboardInput
                    placeholder="Click URL"
                    value={card.clickUrl}
                    onChange={(e) =>
                      updateCardField(
                        cards,
                        errors,
                        index,
                        { ...card, clickUrl: e.target.value },
                        setCards,
                        setErrors,
                      )
                    }
                    onBlur={(e) =>
                      setCardErrorAt(
                        errors,
                        index,
                        { ...card, clickUrl: e.target.value },
                        setErrors,
                      )
                    }
                  />
                  <ErrorText message={errors[index]?.clickUrl} />
                </div>
              </div>
            </div>

            <div className="space-y-2 justify-self-stretch xl:sticky xl:top-4">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Image
              </div>
              <FileUpload
                value={card.image}
                onChange={(urlOrFile) =>
                  updateCardField(
                    cards,
                    errors,
                    index,
                    { ...card, image: urlOrFile },
                    setCards,
                    setErrors,
                  )
                }
                onBlur={() =>
                  setCardErrorAt(errors, index, { ...card }, setErrors)
                }
                placeholder="Paste or upload image"
              />
              <ErrorText message={errors[index]?.image} />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={onAddCard}>
        <Plus className="mr-2 size-4" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {!hasExistingHero ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create hero section</CardTitle>
            <CardDescription>
              Create a backend-managed hero bundle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderCards(
              form.slides,
              formErrors.slides,
              (slides) => setForm({ ...form, slides }),
              (slidesErrors) =>
                setFormErrors({ ...formErrors, slides: slidesErrors }),
              () => setForm({ ...form, slides: [...form.slides, emptyCard()] }),
              'slides',
              'Slides',
            )}
            {renderCards(
              form.features,
              formErrors.features,
              (features) => setForm({ ...form, features }),
              (featuresErrors) =>
                setFormErrors({ ...formErrors, features: featuresErrors }),
              () =>
                setForm({ ...form, features: [...form.features, emptyCard()] }),
              'features',
              'Features',
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <Button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const validation = validateHeroSection(form);
                  if (!validation.ok) {
                    setFormErrors(validation.errors);
                    return;
                  }

                  setFormErrors(emptyErrors());
                  const result = await createHeroSection(form);
                  if (!result?.success)
                    return refresh(
                      result?.message ?? 'Failed to create hero section.',
                      'error',
                    );
                  const createdHero = result.data;
                  if (createdHero) {
                    setHeroRows((current) => [createdHero, ...current]);
                  }
                  setForm(emptyHero());
                  refresh(
                    result.message ?? 'Hero section created successfully.',
                    'success',
                  );
                })
              }
            >
              Create hero section
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <div className="space-y-4">
        {rows.map((hero) => {
          const isEditing = editingId === hero._id;
          const active = isEditing ? editingForm : hero;
          return (
            <Card
              key={hero._id ?? hero.slides[0]?.title ?? 'hero-section'}
              className="shadow-sm"
            >
              <CardHeader>
                <CardTitle>Hero bundle</CardTitle>
                <CardDescription>
                  {hero.slides.length} slides · {hero.features.length} features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCards(
                  active.slides as ReturnType<typeof emptyCard>[],
                  isEditing ? editingErrors.slides : [],
                  (slides) =>
                    isEditing && setEditingForm({ ...editingForm, slides }),
                  (slidesErrors) =>
                    isEditing &&
                    setEditingErrors({
                      ...editingErrors,
                      slides: slidesErrors,
                    }),
                  () => {
                    if (!hero._id) return;

                    if (!isEditing) {
                      setEditingId(hero._id);
                      setEditingForm({
                        slides: [...hero.slides, emptyCard()],
                        features: hero.features,
                        isActive: hero.isActive,
                      });
                      return;
                    }

                    setEditingForm({
                      ...editingForm,
                      slides: [...editingForm.slides, emptyCard()],
                    });
                  },
                  'slides',
                  'Slides',
                )}
                {renderCards(
                  active.features as ReturnType<typeof emptyCard>[],
                  isEditing ? editingErrors.features : [],
                  (features) =>
                    isEditing && setEditingForm({ ...editingForm, features }),
                  (featuresErrors) =>
                    isEditing &&
                    setEditingErrors({
                      ...editingErrors,
                      features: featuresErrors,
                    }),
                  () => {
                    if (!hero._id) return;

                    if (!isEditing) {
                      setEditingId(hero._id);
                      setEditingForm({
                        slides: hero.slides,
                        features: [...hero.features, emptyCard()],
                        isActive: hero.isActive,
                      });
                      return;
                    }

                    setEditingForm({
                      ...editingForm,
                      features: [...editingForm.features, emptyCard()],
                    });
                  },
                  'features',
                  'Features',
                )}
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        disabled={isPending || !hero._id}
                        onClick={() => {
                          const heroId = hero._id;
                          if (!heroId) return;
                          startTransition(async () => {
                            const validation = validateHeroSection(editingForm);
                            if (!validation.ok) {
                              setEditingErrors(validation.errors);
                              return;
                            }

                            setEditingErrors(emptyErrors());
                            const result = await updateHeroSection(
                              heroId,
                              editingForm,
                            );
                            if (!result?.success)
                              return refresh(
                                result?.message ??
                                'Failed to update hero section.',
                                'error',
                              );
                            const updatedHero = result.data;
                            if (updatedHero) {
                              setHeroRows((current) =>
                                current.map((item) =>
                                  item._id === heroId ? updatedHero : item,
                                ),
                              );
                            }
                            setEditingId(null);
                            refresh(
                              result.message ??
                                'Hero section updated successfully.',
                              'success',
                            );
                          });
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(hero._id ?? null);
                          setEditingForm({
                            slides: hero.slides,
                            features: hero.features,
                            isActive: hero.isActive,
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isPending || !hero._id}
                        onClick={() =>
                          hero._id
                            ? setPendingDeleteHero({
                                id: hero._id,
                                label:
                                  hero.slides[0]?.title || 'this hero section',
                              })
                            : undefined
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteHero)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDeleteHero}
        isPending={isPending}
        title="Delete hero section?"
        description={`This will permanently delete ${pendingDeleteHero?.label || 'this hero section'} and its slides/features.`}
        confirmLabel="Delete hero"
      />
    </div>
  );
}
