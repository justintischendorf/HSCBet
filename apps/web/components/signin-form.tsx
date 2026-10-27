"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
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

import { BackupAccordion } from "./backup-accordion";
import Footer from "./footer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "./ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./ui/input-otp";

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [codeDialogOpen, setCodeDialogOpen] = React.useState(false);

  async function handleLogin() {
    const { error } = await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            setCodeDialogOpen(true);
          } else {
            router.replace("/dashboard");
          }
        },
      },
    );

    if (error) {
      toast.error(error.status + ": " + error.message);
      return;
    }
  }

  async function handleCodeValidation(code: string) {
    const { error } = await authClient.twoFactor.verifyTotp({
      code: code.trim(),
      trustDevice: false,
    });

    if (error) {
      toast.error("Ungültiger Code. Bitte versuche es erneut.");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Willkommen zurück</h1>
                <p className="text-balance text-muted-foreground">
                  Bitte melde dich an, um fortzufahren
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Passwort</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </Field>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                oder
              </FieldSeparator>
              <FieldDescription className="text-center">
                Du hast noch keinen Account?{" "}
                <Link href="/signup">Registrieren</Link>
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
      <AlertDialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <AlertDialogContent className="flex items-center justify-center flex-col gap-5 p-5">
          <AlertDialogHeader>
            <AlertDialogTitle>Zwei-Faktor-Authentifizierung</AlertDialogTitle>
            <AlertDialogDescription>
              Bitte gib den 6-stelligen Verifizierungscode von deiner
              Authentifizierungs-App ein, um dich anzumelden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <InputOTP
            id="digits-only"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e);
              if (e.length === 6) {
                void handleCodeValidation(e);
              }
            }}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              <InputOTPSlot
                index={0}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
              <InputOTPSlot
                index={1}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
              <InputOTPSlot
                index={2}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot
                index={3}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
              <InputOTPSlot
                index={4}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
              <InputOTPSlot
                index={5}
                className="sm:w-12 sm:h-12 w-10 h-10 text-xl"
              />
            </InputOTPGroup>
          </InputOTP>
          <BackupAccordion />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
