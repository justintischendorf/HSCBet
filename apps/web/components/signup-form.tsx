"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import Footer from "./footer";
import PasswordSafetyLevel from "./password-safety-level";

const MAX_USERNAME_LENGTH = 22;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [usernameAvailable, setUsernameAvailable] =
    React.useState(MAX_USERNAME_LENGTH);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  async function handleSignup() {
    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    const { error: signupError } = await authClient.signUp.email({
      name: username,
      email: email,
      password: password,
    });

    if (signupError) {
      toast.error(signupError.status + ": " + signupError.message);
      return;
    }

    toast.success("Account erfolgreich erstellt");
    router.push("/dashboard");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Erstelle deinen Account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Gib deinen Nutzernamen, deine E-Mail-Adresse und ein sicheres
                  Passwort ein, um loszulegen.
                </p>
              </div>
              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel htmlFor="username">Nutzername</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    {usernameAvailable}
                  </p>
                </div>
                <Input
                  id="username"
                  value={username}
                  maxLength={MAX_USERNAME_LENGTH}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameAvailable(
                      MAX_USERNAME_LENGTH - e.target.value.length,
                    );
                  }}
                  type="text"
                  placeholder="Dein Nutzername"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldDescription>
                  Wir werden deine E-Mail-Adresse niemals mit Dritten teilen.
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Passwort</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        required
                        aria-invalid={password !== confirmPassword}
                        className="pr-7"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Passwort bestätigen
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        aria-invalid={password !== confirmPassword}
                        className="pr-7"
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
                  </Field>
                </Field>
                <div className="pt-2">
                  <PasswordSafetyLevel input={password} />
                </div>
              </Field>
              <Field>
                <Button type="submit">Account erstellen</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                oder
              </FieldSeparator>
              <FieldDescription className="text-center">
                Du hast bereits einen Account?{" "}
                <Link href="/signin">Anmelden</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              loading="eager"
              width={1920}
              height={1080}
              src="/assets/images/player.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}
