"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [otp, setOtp] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  async function handleSendCode() {
    if (!email) return;

    setIsSending(true);
    const { error } = await authClient.emailOtp.requestPasswordReset({
      email,
    });
    setIsSending(false);

    if (error) {
      toast.error(error.message ?? "E-Mail konnte nicht gesendet werden.");
      return;
    }

    setCodeSent(true);
    setCodeVerified(false);
    setOtp("");
    toast.success("E-Mail gesendet! Bitte checke deinen Posteingang.");
  }

  async function handleVerifyOtp(value: string) {
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp: value,
      type: "forget-password",
    });

    if (error) {
      toast.error("Ungültiger Code. Bitte versuche es erneut.");
      return;
    }

    setCodeVerified(true);
    toast.success("Code bestätigt. Bitte vergib ein neues Passwort.");
  }

  async function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsResetting(true);
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: newPassword,
    });
    setIsResetting(false);

    if (error) {
      toast.error(error.message ?? "Passwort konnte nicht geändert werden.");
      return;
    }

    toast.success("Passwort erfolgreich geändert.");
    router.replace("/signin");
  }

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="flex justify-center items-center mb-10">
        <Image
          loading="eager"
          src="assets/logos/logo-hscbet-full.light.svg"
          alt="Logo"
          width={100}
          height={100}
          className="size-40 block dark:hidden"
        />
        <Image
          loading="eager"
          src="assets/logos/logo-hscbet-full.dark.svg"
          alt="Logo"
          width={100}
          height={100}
          className="size-40 hidden dark:block"
        />
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          Passwort zurücksetzen
        </h1>
        <p className="text-base">
          Gib deine E-Mail-Adresse ein, um einen Bestätigungscode zu erhalten.
        </p>
        <Separator className="sm:my-8 my-6" />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">E-Mail-Adresse</FieldLabel>
            <Input
              id="email"
              required
              type="email"
              value={email}
              disabled={codeSent}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail-Adresse"
            />
          </Field>
          <Field>
            <Button disabled={!email || isSending} onClick={handleSendCode}>
              {isSending
                ? "Wird gesendet..."
                : codeSent
                  ? "Code erneut senden"
                  : "Bestätigungsmail senden"}
            </Button>
          </Field>

          {codeSent && (
            <Field>
              <FieldLabel htmlFor="otp">Bestätigungscode</FieldLabel>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                disabled={codeVerified}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length === 6) {
                    void handleVerifyOtp(value);
                  }
                }}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </Field>
          )}

          {codeVerified && (
            <>
              <Field>
                <FieldLabel htmlFor="new-password">Neues Passwort</FieldLabel>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <FieldLabel htmlFor="confirm-password">
                  Passwort bestätigen
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button disabled={isResetting} onClick={handleResetPassword}>
                  {isResetting ? "Wird gespeichert..." : "Passwort ändern"}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </div>
    </main>
  );
}
