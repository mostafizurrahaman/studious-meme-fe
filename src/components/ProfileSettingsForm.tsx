'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, useWatch } from 'react-hook-form';
import { type z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  changePassword,
  updateProfileData,
  updateProfilePhoto,
} from '@/services/Auth';
import { useUser } from '@/context/UserContext';
import { UserAvatar } from '@/components/UserAvatar';
import { makeZodResolver, profileFormSchemas } from '@/lib/form-validation';

type ProfileValues = z.infer<typeof profileFormSchemas.profile>;
type PasswordValues = z.infer<typeof profileFormSchemas.password>;

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

export function ProfileSettingsForm({
  profile,
}: {
  profile: {
    name: string;
    phone?: string;
    dob?: string;
    email: string;
    image?: string | null;
  };
}) {
  const router = useRouter();
  const { setIsLoading } = useUser();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(profile.image ?? '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: makeZodResolver(profileFormSchemas.profile),
    defaultValues: {
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      dob: profile.dob ? String(profile.dob).slice(0, 10) : '',
    },
    mode: 'onTouched',
  });

  const profileName = useWatch({
    control: profileForm.control,
    name: 'name',
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: makeZodResolver(profileFormSchemas.password),
    defaultValues: { oldPassword: '', newPassword: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageSelect(file?: File) {
    if (!file) return;

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
            <UserAvatar
              name={profileName}
              image={imagePreview}
              className="size-16"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">
                Profile photo
              </div>
              <div className="text-xs text-muted-foreground">
                Upload a new photo for your account avatar.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Choose image
                </Button>
                <Button
                  type="button"
                  disabled={isPhotoSaving || !imageFile}
                  onClick={async () => {
                    if (!imageFile) {
                      toast.error('Profile photo is required.');
                      return;
                    }

                    setIsPhotoSaving(true);
                    const formData = new FormData();
                    formData.append('user', imageFile);

                    const result = await updateProfilePhoto(formData);
                    setIsPhotoSaving(false);

                    if (!result?.success) {
                      toast.error(
                        result?.message ?? 'Failed to update profile photo.',
                      );
                      return;
                    }

                    setIsLoading(true);
                    setImageFile(null);
                    router.refresh();
                    toast.success(
                      result.message ?? 'Photo updated successfully.',
                    );
                  }}
                >
                  {isPhotoSaving ? 'Updating photo...' : 'Update photo'}
                </Button>
              </div>
            </div>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              handleImageSelect(event.target.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
          <Input value={profile.email} disabled />
          <Input placeholder="Name" {...profileForm.register('name')} />
          <ErrorText message={profileForm.formState.errors.name?.message} />
          <Input placeholder="Phone" {...profileForm.register('phone')} />
          <ErrorText message={profileForm.formState.errors.phone?.message} />
          <Input type="date" {...profileForm.register('dob')} />
          <ErrorText message={profileForm.formState.errors.dob?.message} />
          <Button
            disabled={isProfileSaving}
            onClick={profileForm.handleSubmit(async (values) => {
              setIsProfileSaving(true);
              const result = await updateProfileData(values);
              setIsProfileSaving(false);

              if (!result?.success) {
                toast.error(result?.message ?? 'Failed to update profile.');
                return;
              }

              setIsLoading(true);
              router.refresh();
              toast.success(result.message ?? 'Profile updated successfully.');
            })}
          >
            {isProfileSaving ? 'Saving profile...' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="relative">
            <Input
              type={showOldPassword ? 'text' : 'password'}
              placeholder="Current password"
              autoComplete="current-password"
              {...passwordForm.register('oldPassword')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((value) => !value)}
              aria-label={
                showOldPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
              className="absolute inset-y-0 right-3 inline-flex items-center text-foreground/50 transition hover:text-foreground"
            >
              {showOldPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ErrorText
            message={passwordForm.formState.errors.oldPassword?.message}
          />
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New password"
              autoComplete="new-password"
              {...passwordForm.register('newPassword')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((value) => !value)}
              aria-label={
                showNewPassword ? 'Hide new password' : 'Show new password'
              }
              className="absolute inset-y-0 right-3 inline-flex items-center text-foreground/50 transition hover:text-foreground"
            >
              {showNewPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ErrorText
            message={passwordForm.formState.errors.newPassword?.message}
          />
          <Button
            disabled={isPasswordSaving}
            onClick={passwordForm.handleSubmit(async (values) => {
              setIsPasswordSaving(true);
              const result = await changePassword(values);
              setIsPasswordSaving(false);

              if (!result?.success) {
                toast.error(result?.message ?? 'Failed to change password.');
                return;
              }

              setIsLoading(true);
              router.refresh();
              passwordForm.reset({ oldPassword: '', newPassword: '' });
              toast.success(result.message ?? 'Password changed successfully.');
            })}
          >
            {isPasswordSaving ? 'Updating password...' : 'Update password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
