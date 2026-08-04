"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { authClient, useSession } from "@/lib/auth-client";

import { ConfirmAlert } from "./confirm-alert";
import PasswordSafetyLevel from "./password-safety-level";

export function AccountPasswordCard() {
  const router = useRouter();
  const session = useSession();
  const user = session?.data?.user;

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showChangePasswordConfirm, setShowChangePasswordConfirm] =
    React.useState(false);

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
      if (newPassword !== confirmPassword) {
        toast.error("Die neuen Passwörter stimmen nicht überein.");
        return;
      }

      if (currentPassword === newPassword) {
        toast.error(
          "Das neue Passwort darf nicht mit dem aktuellen Passwort übereinstimmen.",
        );
        return;
      }

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

    const { error: signOutError } = await authClient.signOut();

    if (signOutError) {
      toast.error(signOutError.status + ": " + signOutError.message);
      return;
    }

    router.replace("/signin");
    toast.success("Passwort erfolgreich aktualisiert!");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Passwort</CardTitle>
        <CardDescription>Ändere dein gesetztes Passwort. </CardDescription>
      </CardHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setShowChangePasswordConfirm(true);
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <Eye size={15} />
                  ) : (
                    <EyeOff size={15} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-row gap-2 w-full">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    aria-invalid={newPassword !== confirmPassword}
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-7"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    aria-invalid={confirmPassword !== newPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-7"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <Eye size={15} />
                    ) : (
                      <EyeOff size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <PasswordSafetyLevel input={newPassword} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-5">
          <Button type="submit" variant="secondary" className="w-full">
            Passwort ändern
          </Button>
        </CardFooter>
      </form>
      <ConfirmAlert
        message="Dein Passwort wird entsprechend aktualisiert und du wirst von allen Geräten abgemeldet."
        open={showChangePasswordConfirm}
        onOpenChange={setShowChangePasswordConfirm}
        onConfirm={async () => {
          await handleUpdatePassword(currentPassword, newPassword);
        }}
        title="Passwort ändern?"
      />
    </Card>
  );
}
