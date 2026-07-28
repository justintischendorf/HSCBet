"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { MailWarning, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TipChart } from "@/components/tip-chart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { groupsQueryKey, groupsQueryFn } from "@/hooks/use-groups";
import {
  notificationsQueryKey,
  notificationsQueryFn,
} from "@/hooks/use-notifications";
import { useRank } from "@/hooks/use-rank";
import {
  seasonStatsQueryKey,
  seasonStatsQueryFn,
} from "@/hooks/use-season-stats";
import { seasonsQueryKey, seasonsQueryFn } from "@/hooks/use-seasons";
import { tipsQueryKey, tipsQueryFn } from "@/hooks/use-tips";
import { authClient, useSession } from "@/lib/auth-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Position } from "@repo/database";

const RANKS = [
  { key: "bronze", label: "Bronze", threshold: 200 },
  { key: "silver", label: "Silber", threshold: 400 },
  { key: "gold", label: "Gold", threshold: 600 },
  { key: "platinum", label: "Platin", threshold: 800 },
  { key: "diamond", label: "Diamant", threshold: 1000 },
] as const;

const POSITION_ASSET_SLUGS: Record<Position, string> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  DEFAULT: "none",
};

const RESEND_COOLDOWN_SECONDS = 20;

export default function DashboardScreen() {
  const session = useSession();
  const user = session?.data?.user;
  const mailVerified = session?.data?.user?.emailVerified;

  const { isPending: isRankPending, data: rankData } = useRank();

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (user && !mailVerified) {
      setShowVerifyDialog(true);
    }
  }, [user, mailVerified]);

  useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSendVerificationCode() {
    if (!user?.email) return;

    setIsSendingCode(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: user.email,
      type: "email-verification",
    });
    setIsSendingCode(false);

    if (error) {
      toast.error(error.status + ": " + error.message);
      return;
    }

    setCodeSent(true);
    setOtp("");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success(
      "Bestätigungscode gesendet! Bitte checke deinen Posteingang.",
    );
  }

  async function handleVerifyCode(value: string) {
    if (!user?.email) return;

    const { error } = await authClient.emailOtp.verifyEmail({
      email: user.email,
      otp: value,
    });

    if (error) {
      toast.error(error.status + ": " + error.message);
      return;
    }

    toast.success("E-Mail-Adresse erfolgreich bestätigt!");
    setShowVerifyDialog(false);
  }

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: groupsQueryKey,
      queryFn: groupsQueryFn,
    });

    queryClient.prefetchQuery({
      queryKey: notificationsQueryKey,
      queryFn: notificationsQueryFn,
    });

    queryClient.prefetchQuery({
      queryKey: seasonStatsQueryKey,
      queryFn: seasonStatsQueryFn,
    });

    queryClient
      .fetchQuery({
        queryKey: seasonsQueryKey,
        queryFn: seasonsQueryFn,
      })
      .then((seasonsResponse) => {
        const firstSeasonId = seasonsResponse?.data?.season?.[0]?.id;
        if (!firstSeasonId) return;

        queryClient.prefetchQuery({
          queryKey: tipsQueryKey(firstSeasonId),
          queryFn: tipsQueryFn(firstSeasonId),
        });
      });
  }, []);

  const points = rankData?.data?.rank?.points;
  const position = rankData?.data?.rank?.position;
  const hasRank = !!position && position !== "DEFAULT";
  const positionSlug = position ? POSITION_ASSET_SLUGS[position] : "none";

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          {!user ? <Skeleton className="h-9 w-48" /> : `Hallo ${user.name}!`}
        </h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base">
            Willkommen auf deinem Dashboard! Hier findest du eine Übersicht über
            deine Aktivitäten und deinen aktuellen Rang.
          </p>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-6 border border-border rounded-xl bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {isRankPending ? (
                <Skeleton className="h-23.25 w-22" />
              ) : (
                <Image
                  loading="eager"
                  src={`/assets/images/rank-${positionSlug}.svg`}
                  alt={position || "Rang"}
                  width={88}
                  height={93}
                  className="w-22 h-23.25 shrink-0"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Aktueller Rang
                </span>
                <h2 className="text-xl font-semibold">
                  {isRankPending ? (
                    <Skeleton className="h-6 w-32" />
                  ) : hasRank ? (
                    RANKS.find((rank) => rank.key === positionSlug)?.label
                  ) : (
                    "Kein Rang"
                  )}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {isRankPending ? (
                    <Skeleton className=" mt-1 h-4 w-16" />
                  ) : (
                    `${points} Punkte`
                  )}
                </span>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-5 gap-1.5 sm:gap-6">
              {RANKS.map((rank) => {
                return (
                  <div
                    key={rank.key}
                    className={cn(
                      "flex flex-col items-center gap-1 text-center transition-opacity min-w-0",
                      !hasRank && "opacity-35 grayscale",
                    )}
                  >
                    <Image
                      loading="eager"
                      src={`/assets/images/rank-${rank.key}.svg`}
                      alt={rank.label}
                      width={112}
                      height={118}
                      className={cn(
                        "h-auto w-11 sm:w-14",
                        rank.key === positionSlug &&
                          "drop-shadow-[0_0_6px_var(--color-primary)]",
                      )}
                    />
                    <span className="w-full truncate text-[10px] font-medium sm:text-sm">
                      {rank.label}
                    </span>
                    <span className="w-full truncate text-[9px] text-muted-foreground sm:text-xs">
                      {rank.threshold} P.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4 border border-border rounded-xl bg-card p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tipp-Statistik</h2>
            <TipChart />
          </div>
        </div>
      </div>

      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-huk-accent">
              <MailWarning className="size-5 text-black" />
            </div>
            <DialogTitle>E-Mail-Adresse bestätigen</DialogTitle>
            <DialogDescription>
              Deine E-Mail-Adresse ist noch nicht bestätigt. Klicke auf den
              Button, um dir einen Bestätigungscode zuschicken zu lassen, und
              gib ihn anschließend hier ein.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-huk-accent" />
            <p>
              Das ist besonders wichtig solltest du dein Passwort einmal
              vergessen, sodass wir sicher sein können, dass die Email-Adresse
              dir gehört.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              disabled={isSendingCode || resendCooldown > 0}
              onClick={handleSendVerificationCode}
            >
              {isSendingCode
                ? "Wird gesendet..."
                : resendCooldown > 0
                  ? `Erneut senden in ${resendCooldown}s`
                  : codeSent
                    ? "Code erneut senden"
                    : "Bestätigungscode senden"}
            </Button>

            {codeSent && (
              <div className="flex flex-col items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground">
                  Code an <span className="font-medium">{user?.email}</span>{" "}
                  gesendet
                </p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (value.length === 6) {
                      void handleVerifyCode(value);
                    }
                  }}
                  pattern={REGEXP_ONLY_DIGITS}
                  containerClassName="justify-center"
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
