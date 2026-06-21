"use client";

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
import { authClient, useSession } from "@/lib/auth-client";
import React, { useEffect } from "react";
import { toast } from "sonner";

export function PasswordCard() {
  const session = useSession();
  const user = session?.data?.user;

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  useEffect(() => {
    if (user) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user]);

  async function handleUpdatePassword(
    currentPassword: string,
    newPassword: string,
  ) {
    if (user) {
      const { error: passwordChangeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (passwordChangeError) {
        toast.error(
          passwordChangeError.status + ": " + passwordChangeError.message,
        );
        return;
      }
    }
    toast.success("Passwort erfolgreich aktualisiert!");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Passwort</CardTitle>
        <CardDescription>Ändere dein gesetztes Passwort. </CardDescription>
      </CardHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleUpdatePassword(currentPassword, newPassword);
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                aria-invalid={newPassword !== confirmPassword}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                aria-invalid={confirmPassword !== newPassword}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-5">
          <Button type="submit" className="w-full">
            Aktualisieren
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
