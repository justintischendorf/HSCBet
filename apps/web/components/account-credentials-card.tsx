'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, useSession } from '@/lib/auth-client';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmAlert } from './confirm-alert';
import { InputProfilePicture } from './input-profile-picture';

export function AccountCredentialsCard() {
  const session = useSession();
  const user = session?.data?.user;

  const [showChangeCredentialsConfirm, setShowChangeCredentialsConfirm] =
    React.useState(false);
  const [username, setUsername] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setUsername(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  async function handleUpdateUserCredentials(username: string, email: string) {
    if (email !== user?.email) {
      const { error: emailChangeError } = await authClient.changeEmail({
        newEmail: email,
      });
      if (emailChangeError) {
        toast.error(emailChangeError.status + ': ' + emailChangeError.message);
        return;
      }
    }

    if (username !== user?.name) {
      const { error: updateUserError } = await authClient.updateUser({
        name: username,
      });
      if (updateUserError) {
        toast.error(updateUserError.status + ': ' + updateUserError.message);
        return;
      }
    }

    toast.success('Profilinformationen erfolgreich aktualisiert!');
  }

  return (
    <Card className="w-full max-w-sm">
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
      >
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <InputProfilePicture />
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
          <Button type="submit" className="w-full">
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
