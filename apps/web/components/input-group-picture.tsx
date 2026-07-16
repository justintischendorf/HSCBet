'use client';

import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, Trash } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { MimeType } from '@repo/database';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function InputGroupPicture({
  fileId,
  onFileIdChange,
  fallbackChar,
}: {
  fileId: string | undefined;
  onFileIdChange: (fileId: string | undefined) => void;
  fallbackChar: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const { mutateAsync: getPresignedUrl, isPending: isUploading } =
    useMutation({
      mutationFn: async (input: {
        filename: string;
        mimetype: MimeType;
        size: number;
      }) => {
        return apiClient.api.media.upload['get-presigned-url'].post(input);
      },
    });

  async function handleFileChange(file: File) {
    await handleGroupFileChange(
      file,
      fileId,
      getPresignedUrl,
      (newFileId, newImageUrl) => {
        onFileIdChange(newFileId);
        setImageUrl(newImageUrl);
      },
    );
  }

  async function handleDelete() {
    await handleDeleteGroupPicture(fileId);
    onFileIdChange(undefined);
    setImageUrl(undefined);
  }

  return (
    <Field className="w-fit items-center gap-6">
      <div className="relative inline-flex">
        <label className="group inline-flex cursor-pointer rounded-full">
          <Avatar
            size="lg"
            className="overflow-hidden transition-transform duration-200"
          >
            <AvatarImage
              id="group-profile-picture"
              src={imageUrl}
              alt="Gruppenbild"
            />
            <AvatarFallback className="text-4xl">{fallbackChar}</AvatarFallback>
            <Input
              id="group-profile-picture-input"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleFileChange(file);
                }
              }}
            />
            <span
              className={cn(
                'pointer-events-none absolute inset-0 rounded-full bg-black/45 transition-opacity duration-200',
                isUploading
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
              )}
            />
            <span
              className={cn(
                'pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-white transition-opacity duration-200',
                isUploading
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
              )}
            >
              {isUploading ? (
                <Spinner className="size-9" />
              ) : (
                <Camera className="size-9" />
              )}
            </span>
          </Avatar>
        </label>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -bottom-1 -right-5 hover:-translate-y-0.5 transition-transform duration-200"
          disabled={isUploading}
          onClick={async (e) => {
            e.preventDefault();
            await handleDelete();
          }}
        >
          <Trash className="size-4" />
        </Button>
      </div>
    </Field>
  );
}

async function handleGroupFileChange(
  file: File,
  previousFileId: string | undefined,
  getPresignedUrl: (input: {
    filename: string;
    mimetype: MimeType;
    size: number;
  }) => ReturnType<
    (typeof apiClient)['api']['media']['upload']['get-presigned-url']['post']
  >,
  onUploaded: (fileId: string, imageUrl: string) => void,
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
    await getPresignedUrl({
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

  if (previousFileId) {
    const { error: previousFileDeleteError } = await apiClient.api
      .media({
        id: previousFileId,
      })
      .delete();

    if (previousFileDeleteError) {
      console.error(
        'Failed to delete previous group picture:',
        previousFileDeleteError,
      );
    }
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${presignedUrlData.file_id}/image`;

  onUploaded(presignedUrlData.file_id, imageUrl);
}

async function handleDeleteGroupPicture(fileId: string | undefined) {
  if (!fileId) {
    toast.error('Du hast kein Gruppenbild ausgewählt.');
    return;
  }

  const { error } = await apiClient.api.media({ id: fileId }).delete();

  if (error) {
    toast.error(error.status + ': ' + error.value.message);
    return;
  }

  toast.success('Gruppenbild erfolgreich gelöscht!');
}
