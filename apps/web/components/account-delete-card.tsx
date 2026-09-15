import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";

import { ConfirmAlert } from "./confirm-alert";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Input } from "./ui/input";

export default function AccountDeleteCard() {
  const router = useRouter();
  const session = useSession();
  const user = session?.data?.user;
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] =
    React.useState(false);

  async function handleDeleteProfilePicture(
    imageUrl: string | null | undefined,
  ) {
    const { error } = await apiClient.api.media["by-url"].delete({
      imageUrl: imageUrl ? imageUrl : "",
    });

    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }
  }

  async function handleDeleteAccount() {
    try {
      await handleDeleteProfilePicture(user?.image);
    } catch (error) {
      toast.error("Fehler beim Löschen des Profilbildes: " + error);
    }

    const { error: deleteError } = await authClient.deleteUser({ password });

    if (deleteError) {
      toast.error(deleteError.status + ": " + deleteError.message);
      return;
    }

    toast.success("Account erfolgreich gelöscht.");
    router.push("/signin");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Account löschen
        </CardTitle>
        <CardDescription>
          Diese Aktion ist unwiderruflich und löscht deinen Account
          einschließlich aller damit verbundenen Daten.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowDeleteAccountConfirm(true);
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-5">
          <Button type="submit" variant="destructive" className="w-full">
            Account löschen
          </Button>
        </CardFooter>
      </form>
      <ConfirmAlert
        message="Dein Acount wird dauerhaft gelöscht und du wirst von allen Geräten abgemeldet."
        open={showDeleteAccountConfirm}
        onOpenChange={setShowDeleteAccountConfirm}
        onConfirm={async () => {
          await handleDeleteAccount();
        }}
        title="Account löschen?"
      />
    </Card>
  );
}
