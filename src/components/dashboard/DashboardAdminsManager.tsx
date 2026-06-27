'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  ShieldPlus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardInput } from '@/components/dashboard/DashboardInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createUser, deleteAdmin, updateAdmin } from '@/services/Admin';
import { formatDashboardDate } from '@/lib/formatDate';
import Image from 'next/image';
import { dashboardFormSchemas, makeZodResolver } from '@/lib/form-validation';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';

type AdminRow = {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type DashboardAdminsManagerProps = {
  admins: AdminRow[];
};

type AdminCreateValues = z.infer<typeof dashboardFormSchemas.admin>;

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

export function DashboardAdminsManager({
  admins,
}: DashboardAdminsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adminRows, setAdminRows] = useState(admins);
  const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
  const [adminImagePreview, setAdminImagePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [editingAdminImageFile, setEditingAdminImageFile] =
    useState<File | null>(null);
  const [editingAdminImagePreview, setEditingAdminImagePreview] = useState('');
  const [editingAdminImageDragging, setEditingAdminImageDragging] =
    useState(false);
  const [adminPendingDelete, setAdminPendingDelete] = useState<Pick<
    AdminRow,
    '_id' | 'name' | 'email'
  > | null>(null);
  const adminImageInputRef = useRef<HTMLInputElement>(null);
  const editingAdminImageInputRef = useRef<HTMLInputElement>(null);

  const createForm = useForm<AdminCreateValues>({
    resolver: makeZodResolver(dashboardFormSchemas.admin),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'ADMIN',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    return () => {
      if (adminImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(adminImagePreview);
      }
      if (editingAdminImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(editingAdminImagePreview);
      }
    };
  }, [adminImagePreview, editingAdminImagePreview]);

  function handleAdminImageSelect(file?: File) {
    if (!file) return;
    if (adminImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(adminImagePreview);
    }
    setAdminImageFile(file);
    setAdminImagePreview(URL.createObjectURL(file));
  }

  function handleEditingAdminImageSelect(file?: File) {
    if (!file) return;
    if (editingAdminImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editingAdminImagePreview);
    }
    setEditingAdminImageFile(file);
    setEditingAdminImagePreview(URL.createObjectURL(file));
  }

  const sortedAdmins = useMemo(
    () =>
      [...admins].sort((a, b) =>
        a.createdAt && b.createdAt ? b.createdAt.localeCompare(a.createdAt) : 0,
      ),
    [admins],
  );

  function closeDeleteDialog() {
    if (isPending) return;
    setAdminPendingDelete(null);
  }

  function confirmDeleteAdmin() {
    const adminId = adminPendingDelete?._id;
    if (!adminId) return;

    startTransition(async () => {
      const result = await deleteAdmin(adminId);
      if (!result?.success) {
        toast.error(result?.message ?? 'Failed to delete admin.');
        return;
      }
      toast.success(result.message ?? 'Admin deleted successfully.');
      setAdminPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create admin</CardTitle>
          <CardDescription>
            Only super admins can create admin accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid items-start gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Name"
              {...createForm.register('name')}
            />
            <ErrorText message={createForm.formState.errors.name?.message} />
          </div>
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Email"
              {...createForm.register('email')}
            />
            <ErrorText message={createForm.formState.errors.email?.message} />
          </div>
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Phone"
              {...createForm.register('phone')}
            />
            <ErrorText message={createForm.formState.errors.phone?.message} />
          </div>
          <div className="self-start md:col-span-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => adminImageInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  adminImageInputRef.current?.click();
                }
              }}
              className="rounded-2xl border-2 border-dashed border-border/70 bg-background/80 p-3 transition hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    Admin image
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click or drop to upload.
                  </p>
                  <div className="mt-2 overflow-hidden rounded-xl border bg-muted">
                    {adminImagePreview ? (
                      <Image
                        height={500}
                        width={500}
                        src={adminImagePreview}
                        alt="Admin preview"
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
                        <ImagePlus className="size-4" />
                        Preview will appear here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <input
              ref={adminImageInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                handleAdminImageSelect(event.target.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </div>
          <div className="relative self-start">
            <DashboardInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...createForm.register('password')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-3 inline-flex items-center text-foreground/50 transition hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ErrorText message={createForm.formState.errors.password?.message} />
          <div className="relative self-start">
            <DashboardInput
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              {...createForm.register('confirmPassword')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
              className="absolute inset-y-0 right-3 inline-flex items-center text-foreground/50 transition hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ErrorText
            message={createForm.formState.errors.confirmPassword?.message}
          />
          <div className="self-start md:col-span-2">
            <Button
              type="button"
              disabled={isCreating}
              onClick={createForm.handleSubmit(async (values) => {
                if (!adminImageFile) {
                  toast.error('Admin image is required.');
                  return;
                }

                setIsCreating(true);
                const result = await createUser({
                  name: values.name,
                  email: values.email,
                  phone: values.phone,
                  password: values.password,
                  image: adminImageFile,
                });
                setIsCreating(false);

                if (!result?.success) {
                  toast.error(result?.message ?? 'Failed to create admin.');
                  return;
                }

                const createdAdmin = result.data as AdminRow | undefined;
                if (createdAdmin) {
                  setAdminRows((current) => [createdAdmin, ...current]);
                }
                toast.success(result.message ?? 'Admin created successfully.');
                createForm.reset();
                setAdminImageFile(null);
                setAdminImagePreview('');
                setShowPassword(false);
                setShowConfirmPassword(false);
                router.refresh();
              })}
              className="gap-2"
            >
              <ShieldPlus className="size-4" />
              {isCreating ? 'Creating admin...' : 'Create admin'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Admin list</CardTitle>
          <CardDescription>
            {admins.length} admin accounts found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAdmins.map((admin) => {
                const isEditing = editingId === admin._id;

                return (
                  <TableRow key={admin._id ?? admin.email}>
                    <TableCell className="min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              editingAdminImageInputRef.current?.click()
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                editingAdminImageInputRef.current?.click();
                              }
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setEditingAdminImageDragging(true);
                            }}
                            onDragLeave={() =>
                              setEditingAdminImageDragging(false)
                            }
                            onDrop={(event) => {
                              event.preventDefault();
                              setEditingAdminImageDragging(false);
                              handleEditingAdminImageSelect(
                                event.dataTransfer.files?.[0],
                              );
                            }}
                            className={`rounded-xl border-2 border-dashed p-2 transition ${
                              editingAdminImageDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border/70 bg-background/80 hover:border-primary/40'
                            }`}
                          >
                            <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                              {editingAdminImagePreview || admin.image ? (
                                <Image
                                  height={500}
                                  width={500}
                                  src={
                                    editingAdminImagePreview ||
                                    admin.image ||
                                    ''
                                  }
                                  alt={admin.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImagePlus className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <input
                            ref={editingAdminImageInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => {
                              handleEditingAdminImageSelect(
                                event.target.files?.[0],
                              );
                              event.currentTarget.value = '';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                          {admin.image ? (
                            <Image
                              height={500}
                              width={500}
                              src={admin.image}
                              alt={admin.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImagePlus className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 whitespace-normal font-medium">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <DashboardInput
                            value={editingForm.name}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        admin.name
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 whitespace-normal">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <DashboardInput
                            value={editingForm.email}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        admin.email
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 whitespace-normal">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <DashboardInput
                            value={editingForm.phone}
                            onChange={(e) =>
                              setEditingForm({
                                ...editingForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        admin.phone || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span
                        className="cursor-help"
                        title={formatDashboardDate(admin.createdAt, {
                          time: true,
                        })}
                      >
                        {formatDashboardDate(admin.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span
                        className="cursor-help"
                        title={formatDashboardDate(admin.updatedAt, {
                          time: true,
                        })}
                      >
                        {formatDashboardDate(admin.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-0">
                      {isEditing ? (
                        <select
                          value={editingForm.isActive ? 'true' : 'false'}
                          onChange={(e) =>
                            setEditingForm({
                              ...editingForm,
                              isActive: e.target.value === 'true',
                            })
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <Badge variant="secondary">
                          {admin.isActive === false ? 'Inactive' : 'Active'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending || !admin._id}
                              onClick={() => {
                                const adminId = admin._id;
                                if (!adminId) return;
                                startTransition(async () => {
                                  const result = await updateAdmin(adminId, {
                                    ...editingForm,
                                    image: editingAdminImageFile ?? undefined,
                                  });
                                  if (!result?.success) {
                                    toast.error(
                                      result?.message ??
                                        'Failed to update admin.',
                                    );
                                    return;
                                  }
                                  toast.success(
                                    result.message ??
                                      'Admin updated successfully.',
                                  );
                                  setEditingId(null);
                                  setEditingAdminImageFile(null);
                                  setEditingAdminImagePreview('');
                                  setEditingAdminImageDragging(false);
                                  router.refresh();
                                });
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setEditingAdminImageFile(null);
                                setEditingAdminImagePreview('');
                                setEditingAdminImageDragging(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!admin._id}
                              onClick={() => {
                                setEditingId(admin._id ?? null);
                                setEditingForm({
                                  name: admin.name,
                                  email: admin.email,
                                  phone: admin.phone ?? '',
                                  isActive: admin.isActive !== false,
                                });
                                setEditingAdminImageFile(null);
                                setEditingAdminImagePreview(admin.image ?? '');
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isPending || !admin._id}
                              onClick={() =>
                                setAdminPendingDelete({
                                  _id: admin._id,
                                  name: admin.name,
                                  email: admin.email,
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={Boolean(adminPendingDelete)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDeleteAdmin}
        isPending={isPending}
        title="Delete admin account?"
        description={`This will permanently delete ${
          adminPendingDelete?.name || adminPendingDelete?.email || 'this admin'
        } from the dashboard.`}
        confirmLabel="Delete admin"
      />
    </div>
  );
}
