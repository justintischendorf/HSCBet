'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, Trash } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { MimeType } from '@repo/database';
import { toast } from 'sonner';
import { Button } from './ui/button';

export function InputProfilePicture({
  fallbackChar,
  currentImageUrl,
  file,
  onFileChange,
  removeExisting,
  onRemoveExistingChange,
}: {
  fallbackChar: string;
  currentImageUrl: string | null | undefined;
  file: File | null;
  onFileChange: (file: File | null) => void;
  removeExisting: boolean;
  onRemoveExistingChange: (remove: boolean) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayImageUrl =
    previewUrl ?? (removeExisting ? undefined : (currentImageUrl ?? undefined));

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
              src={displayImageUrl}
              alt="Profilbild"
            />
            <AvatarFallback className="text-4xl">{fallbackChar}</AvatarFallback>
            <Input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                e.target.value = '';
                if (!selected) return;

                if (!isSupportedImage(selected)) {
                  toast.error(
                    'Nicht unterstütztes Dateiformat. Bitte wähle ein PNG- oder JPEG-Bild aus.',
                  );
                  return;
                }

                onFileChange(selected);
                onRemoveExistingChange(false);
              }}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100" />
            <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
              <Camera className="size-9" />
            </span>
          </Avatar>
        </label>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -bottom-1 -right-5 hover:-translate-y-0.5 transition-transform duration-200"
          onClick={(e) => {
            e.preventDefault();
            if (file) {
              onFileChange(null);
              return;
            }
            if (currentImageUrl) {
              onRemoveExistingChange(true);
              return;
            }
            toast.error('Du hast kein Profilbild ausgewählt.');
          }}
        >
          <Trash className="size-4" />
        </Button>
      </div>
    </Field>
  );
}

function isSupportedImage(file: File) {
  return (
    file.type === 'image/png' ||
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg'
  );
}

/**
 * Lädt ein ausgewähltes Profilbild erst tatsächlich zu MinIO hoch und
 * hinterlegt es am User. Wird vom aufrufenden Formular erst beim
 * tatsächlichen Speichern aufgerufen, nicht bereits bei der Bildauswahl.
 */
export async function uploadProfilePicture(
  file: File,
  previousImageUrl: string | null | undefined,
  getPresignedUrl: (input: {
    filename: string;
    mimetype: MimeType;
    size: number;
  }) => ReturnType<
    (typeof apiClient)['api']['media']['upload']['get-presigned-url']['post']
  >,
) {
  let fileType: MimeType = 'IMAGE_JPEG';
  if (file.type === 'image/png') {
    fileType = 'IMAGE_PNG';
  } else if (file.type === 'image/jpg' || file.type === 'image/jpeg') {
    fileType = 'IMAGE_JPEG';
  } else {
    toast.error('Unsupported file type. Please select a PNG or JPEG image.');
    return false;
  }

  const { error: presignedUrlError, data: presignedUrlData } =
    await getPresignedUrl({
      filename: file.name,
      mimetype: fileType,
      size: file.size,
    });

  if (presignedUrlError) {
    toast.error('Failed to get presigned URL. Please try again.');
    return false;
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
    return false;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${presignedUrlData.file_id}/image`;

  const { error: updateUserError } = await authClient.updateUser({
    image: imageUrl,
  });

  if (updateUserError) {
    toast.error(updateUserError.status + ': ' + updateUserError.message);
    return false;
  }

  if (previousImageUrl && previousImageUrl !== imageUrl) {
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

  return true;
}

export async function removeProfilePicture(imageUrl: string) {
  const { error } = await apiClient.api.media['by-url'].delete({
    imageUrl,
  });

  if (error) {
    toast.error(error.status + ': ' + error.value.message);
    return false;
  }

  const { error: updateUserError } = await authClient.updateUser({
    image: null,
  });

  if (updateUserError) {
    toast.error(updateUserError.status + ': ' + updateUserError.message);
    return false;
  }

  return true;
}
