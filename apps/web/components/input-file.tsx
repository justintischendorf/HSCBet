'use client';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, Trash } from 'lucide-react';
import { authClient, useSession } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { MimeType } from '@repo/database';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function InputFile() {
  const { data: session, refetch, isPending } = useSession();
  const user = session?.user;
  const fallbackChar = user?.name?.charAt(0).toUpperCase() ?? '?';

  if (isPending) {
    return <Skeleton className="size-30 rounded-full" />;
  }

  return (
    <Field className="w-fit items-center gap-6">
      <div className="relative inline-block">
        <label className="group inline-flex cursor-pointer rounded-full">
          <Avatar
            size="lg"
            className="overflow-hidden transition-transform duration-200"
          >
            <AvatarImage
              id="profile-picture"
              src={
                user?.image ||
                `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user?.name}`
              }
              alt="Profilbild"
            />
            <AvatarFallback>{fallbackChar}</AvatarFallback>
            <Input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleFileChange(file, user?.image ?? undefined);
                  await refetch();
                }
              }}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
            <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              <Camera className="size-9" />
            </span>
          </Avatar>
        </label>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -bottom-1 -right-5 hover:-translate-y-0.5 transition-transform duration-200"
          onClick={async (e) => {
            e.preventDefault();
            await handleDeleteProfilePicture(user?.image, refetch);
          }}
        >
          <Trash className="size-4" />
        </Button>
      </div>
    </Field>
  );
}

export async function handleFileChange(
  file: File,
  previousImageUrl?: string | null,
) {
  let fileType: MimeType = 'IMAGE_JPEG';
  if (file.type === 'image/png') {
    fileType = 'IMAGE_PNG';
  } else if (file.type === 'image/jpg' || file.type === 'image/jpeg') {
    fileType = 'IMAGE_JPEG';
  } else {
    toast.error('Unsupported file type. Please select a PNG or JPEG image.');
    return;
  }

  const { error: presignedUrlError, data: presignedUrlData } =
    await apiClient.api.media.upload['get-presigned-url'].post({
      filename: file.name,
      mimetype: fileType,
      size: file.size,
    });

  if (presignedUrlError) {
    toast.error('Failed to get presigned URL. Please try again.');
    return;
  }

  try {
    await fetch(presignedUrlData.pre_signed_url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
  } catch (err) {
    toast.error('Failed to upload file.' + err);
    return;
  }

  const { error: downloadUrlError, data: downloadUrlData } = await apiClient.api
    .media({ id: presignedUrlData.file_id })
    ['download-url'].get();

  if (downloadUrlError) {
    toast.error('Failed to get download URL. Please try again.');
    return;
  }

  const { error: updateUserError } = await authClient.updateUser({
    image: downloadUrlData.url,
  });

  if (updateUserError) {
    toast.error(updateUserError.status + ': ' + updateUserError.message);
    return;
  }

  if (previousImageUrl && previousImageUrl !== downloadUrlData.url) {
    const { error: previousImageDeleteError } = await apiClient.api.media[
      'by-url'
    ].delete({
      imageUrl: previousImageUrl,
    });

    if (previousImageDeleteError) {
      console.error(
        'Failed to delete previous profile picture:',
        previousImageDeleteError,
      );
    }
  }
}

export async function handleDeleteProfilePicture(
  imageUrl: string | null | undefined,
  refetch: () => Promise<unknown>,
) {
  if (!imageUrl) {
    toast.error('Du hast kein Profilbild gesetzt.');
    return;
  }

  const { error } = await apiClient.api.media['by-url'].delete({
    imageUrl: imageUrl,
  });

  if (error) {
    toast.error(error.status + ': ' + error.value.message);
    return;
  }

  const { error: updateUserError } = await authClient.updateUser({
    image: null,
  });

  if (updateUserError) {
    toast.error(updateUserError.status + ': ' + updateUserError.message);
    return;
  }

  await refetch();
  toast.success('Profilbild erfolgreich gelöscht!');
}
