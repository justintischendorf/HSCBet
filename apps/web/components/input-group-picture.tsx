"use client";

import { Camera, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { MimeType } from "@repo/database";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export function InputGroupPicture({
  file,
  onFileChange,
  fallbackChar,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  fallbackChar: string;
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
              src={previewUrl}
              alt="Gruppenbild"
            />
            <AvatarFallback className="text-4xl">{fallbackChar}</AvatarFallback>
            <Input
              id="group-profile-picture-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                e.target.value = "";
                if (!selected) return;

                if (!isSupportedImage(selected)) {
                  toast.error(
                    "Nicht unterstütztes Dateiformat. Bitte wähle ein PNG- oder JPEG-Bild aus.",
                  );
                  return;
                }

                onFileChange(selected);
              }}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-background/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100" />
            <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
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
            onFileChange(null);
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
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg"
  );
}

/**
 * Lädt ein ausgewähltes Gruppenbild erst tatsächlich zu MinIO hoch. Wird vom
 * aufrufenden Formular erst beim tatsächlichen Erstellen der Gruppe
 * aufgerufen, nicht bereits bei der Bildauswahl.
 */
export async function uploadGroupPicture(
  file: File,
  getPresignedUrl: (input: {
    filename: string;
    mimetype: MimeType;
    size: number;
  }) => ReturnType<
    (typeof apiClient)["api"]["media"]["upload"]["get-presigned-url"]["post"]
  >,
): Promise<{ fileId: string; imageUrl: string } | undefined> {
  let fileType: MimeType = "IMAGE_JPEG";
  if (file.type === "image/png") {
    fileType = "IMAGE_PNG";
  } else if (file.type === "image/jpg" || file.type === "image/jpeg") {
    fileType = "IMAGE_JPEG";
  } else {
    toast.error("Unsupported file type. Please select a PNG or JPEG image.");
    return;
  }

  const { error: presignedUrlError, data: presignedUrlData } =
    await getPresignedUrl({
      filename: file.name,
      mimetype: fileType,
      size: file.size,
    });

  if (presignedUrlError) {
    toast.error("Failed to get presigned URL. Please try again.");
    return;
  }

  try {
    await fetch(presignedUrlData.pre_signed_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (err) {
    toast.error("Failed to upload file." + err);
    return;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${presignedUrlData.file_id}/image`;

  return { fileId: presignedUrlData.file_id, imageUrl };
}
