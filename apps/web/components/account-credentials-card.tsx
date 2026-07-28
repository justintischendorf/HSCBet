"use client";

import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import { MimeType } from "@repo/database";

import { ConfirmAlert } from "./confirm-alert";
import {
  InputProfilePicture,
  removeProfilePicture,
  uploadProfilePicture,
} from "./input-profile-picture";
import { Spinner } from "./ui/spinner";

export function AccountCredentialsCard({
  user,
}: {
  user: { name: string; email: string; image?: string | null } | undefined;
}) {
  const { refetch } = useSession();
  const [showChangeCredentialsConfirm, setShowChangeCredentialsConfirm] =
    React.useState(false);
  const [username, setUsername] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [removeExistingPicture, setRemoveExistingPicture] =
    React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { mutateAsync: getPresignedUrl } = useMutation({
    mutationFn: async (input: {
      filename: string;
      mimetype: MimeType;
      size: number;
    }) => {
      return apiClient.api.media.upload["get-presigned-url"].post(input);
    },
  });

  useEffect(() => {
    if (user) {
      setUsername(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleUpdateUserCredentials(username: string, email: string) {
    setIsSubmitting(true);

    if (pendingFile) {
      const uploaded = await uploadProfilePicture(
        pendingFile,
        user?.image,
        getPresignedUrl,
      );
      if (!uploaded) {
        setIsSubmitting(false);
        return;
      }
    } else if (removeExistingPicture && user?.image) {
      const removed = await removeProfilePicture(user.image);
      if (!removed) {
        setIsSubmitting(false);
        return;
      }
    }

    if (email !== user?.email) {
      const { error: emailChangeError } = await authClient.changeEmail({
        newEmail: email,
      });
      if (emailChangeError) {
        toast.error(emailChangeError.status + ": " + emailChangeError.message);
        setIsSubmitting(false);
        return;
      }
    }

    if (username !== user?.name) {
      const { error: updateUserError } = await authClient.updateUser({
        name: username,
      });
      if (updateUserError) {
        toast.error(updateUserError.status + ": " + updateUserError.message);
        setIsSubmitting(false);
        return;
      }
    }

    await refetch();
    setPendingFile(null);
    setRemoveExistingPicture(false);
    setIsSubmitting(false);
    toast.success("Profilinformationen erfolgreich aktualisiert!");
  }

  return (
    <Card className="w-full flex flex-2">
      <CardHeader>
        <CardTitle>Konto Informationen</CardTitle>
        <CardDescription>
          Ändere deinen Nutzernamen, dein Profilbild oder deine Email-Adresse.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowChangeCredentialsConfirm(true);
        }}
        className="flex flex-col flex-1"
      >
        <CardContent className="flex flex-1 flex-col justify-center">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <InputProfilePicture
                fallbackChar={(username || user?.name || "?")
                  .charAt(0)
                  .toUpperCase()}
                currentImageUrl={user?.image}
                file={pendingFile}
                onFileChange={setPendingFile}
                removeExisting={removeExistingPicture}
                onRemoveExistingChange={setRemoveExistingPicture}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Nutzername</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-5">
          <Button
            variant="outline"
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            Kontoinformationen aktualisieren
          </Button>
        </CardFooter>
      </form>
      <ConfirmAlert
        message="Deine Kontoinformationen werden entsprechend aktualisiert."
        open={showChangeCredentialsConfirm}
        onOpenChange={setShowChangeCredentialsConfirm}
        onConfirm={async () => {
          await handleUpdateUserCredentials(username, email);
        }}
      />
    </Card>
  );
}
