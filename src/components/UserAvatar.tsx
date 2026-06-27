'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(name?: string | null): string {
  if (!name) return 'U';

  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  image,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const safeImage = image?.trim() || '';

  return (
    <Avatar className={cn(className)}>
      {safeImage ? <AvatarImage src={safeImage} alt={name ?? 'User'} /> : null}
      <AvatarFallback className={fallbackClassName}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
