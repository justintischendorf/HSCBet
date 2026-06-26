'use client';

import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialog,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { authClient, useSession } from '@/lib/auth-client';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import CopyButton from '@/components/copy-button';

export default function AccountSettings() {
  const { data: sessionData, refetch } = useSession();
  const user = sessionData?.user;
  const [step, setStep] = React.useState<'idle' | 'qr'>('idle');
  const [totpURI, setTotpURI] = React.useState('');
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState<
    'enable' | 'disable' | null
  >(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const isTwoFactorEnabled = Boolean(user?.twoFactorEnabled);
  const dialogTitle = isTwoFactorEnabled
    ? '2-Faktor-Authentifizierung deaktivieren'
    : '2-Faktor-Authentifizierung aktivieren';
  const statusText = isTwoFactorEnabled ? 'Aktiviert' : 'Deaktiviert';
  const statusClass = isTwoFactorEnabled ? 'text-positive' : 'text-destructive';
  const actionLabel = isTwoFactorEnabled ? 'Deaktivieren' : 'Aktivieren';

  async function handleVerifyTotp(code: string) {
    setIsSubmitting(true);
    const { error } = await authClient.twoFactor.verifyTotp({
      code: code,
      trustDevice: true,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'Die 2FA-Verifizierung ist fehlgeschlagen.');
      return;
    }

    await refetch?.();
    setStep('idle');
    setTotpURI('');
    setBackupCodes([]);
    setCode('');
    toast.success('2-Faktor-Authentifizierung aktiviert!');
  }

  function openPasswordDialog() {
    setPendingAction(isTwoFactorEnabled ? 'disable' : 'enable');
    setPassword('');
    setPasswordDialogOpen(true);
  }

  async function handlePasswordConfirm() {
    if (!password.trim()) {
      toast.error('Aktion abgebrochen: Passwort benötigt.');
      return;
    }

    setIsSubmitting(true);

    if (pendingAction === 'disable') {
      const { error } = await authClient.twoFactor.disable({ password });
      setIsSubmitting(false);
      if (error) {
        toast.error('Fehler beim Deaktivieren der 2-Faktor-Authentifizierung.');
        return;
      }

      await refetch?.();
      setPasswordDialogOpen(false);
      setPendingAction(null);
      setPassword('');
      toast.success('2-Faktor-Authentifizierung deaktiviert!');
      return;
    }

    const { error, data } = await authClient.twoFactor.enable({
      password,
      issuer: 'HSCBet',
    });
    setIsSubmitting(false);

    if (error) {
      toast.error('Fehler beim Aktivieren der 2-Faktor-Authentifizierung.');
      return;
    }

    setPasswordDialogOpen(false);
    setPendingAction(null);
    setPassword('');

    if (data?.totpURI) {
      setStep('qr');
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes || []);
    }
  }

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">2FA</h1>
        <p className="text-base">
          Hier kannst du die 2-Faktor-Authentifizierung für dein Konto
          aktivieren oder deaktivieren.
        </p>
        <Separator className="sm:my-8 my-6" />

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-row items-center justify-between border border-border rounded-lg p-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Status</h2>
              <p className={`text-sm ${statusClass}`}>{statusText}</p>
            </div>
            <Button
              type="button"
              variant="default"
              onClick={openPasswordDialog}
            >
              {actionLabel}
            </Button>
          </div>

          <AlertDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  Bitte bestätige die Aktion mit deinem Passwort.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    void handlePasswordConfirm();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Bitte warten...' : 'Weiter'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {step === 'qr' && (
            <div className="flex flex-col border border-border rounded-lg p-4 sm:gap-8 gap-6">
              <div className="flex flex-row items-center gap-2">
                <ShieldAlert />
                <h2 className="text-lg font-bold">
                  2FA-Einrichtung abschließen
                </h2>
              </div>

              <div className="flex flex-row gap-4 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-huk-accent shrink-0">
                  <span className="text-sm font-bold text-black">1</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">
                  Scanne den QR-Code mit deiner Authenticator-App z.B. Google
                  Authenticator oder Authy, um die 2-Faktor-Authentifizierung zu
                  aktivieren.
                </p>
              </div>

              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(totpURI)}&size=200x200`}
                alt="QR Code"
                width={200}
                height={200}
                className="rounded-md p-1 border border-accent-foreground mx-auto"
              />

              <div className="flex flex-row gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-huk-accent shrink-0">
                  <span className="text-sm font-bold text-black">2</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">
                  Notiere die Backup-Codes an einem sicheren Ort. Sie können
                  verwendet werden, falls du keinen Zugriff auf deine
                  Authenticator-App hast.
                </p>
              </div>

              <ul className="flex flex-col sm:flex-row justify-center gap-2 mx-auto">
                {backupCodes.slice(0, 3).map((c, index) => (
                  <li
                    key={index}
                    className="text-sm border border-border rounded-md px-4 py-1"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <span>{c}</span>
                      <CopyButton textToCopy={c} />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-row gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-huk-accent shrink-0">
                  <span className="text-sm font-bold text-black">3</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">
                  Gib den 6-stelligen Code aus deiner Authenticator-App ein, um
                  die Einrichtung abzuschließen. Du kannst die 2FA jederzeit
                  deaktivieren, indem du auf die Schaltfläche "Deaktivieren"
                  klickst.
                </p>
              </div>

              <div className="w-full flex flex-col items-center gap-2 justify-center">
                <Field className="w-fit">
                  <InputOTP
                    id="digits-only"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e);
                      if (e.length === 6) {
                        void handleVerifyTotp(e);
                      }
                    }}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-10 w-10" />
                      <InputOTPSlot index={1} className="h-10 w-10" />
                      <InputOTPSlot index={2} className="h-10 w-10" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-10 w-10" />
                      <InputOTPSlot index={4} className="h-10 w-10" />
                      <InputOTPSlot index={5} className="h-10 w-10" />
                    </InputOTPGroup>
                  </InputOTP>
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
