"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

type ReviewAction = "approve" | "reject";

const reviewErrors: Record<string, string> = {
  INVALID_TOKEN: "Der Link ist ungültig oder abgelaufen.",
  NOT_FOUND: "Der Nutzer existiert nicht mehr (bereits abgelehnt?).",
  ALREADY_APPROVED: "Der Nutzer wurde bereits zugelassen.",
};

function ReviewSignup() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const action: ReviewAction =
    searchParams.get("action") === "reject" ? "reject" : "approve";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // explicit button instead of reviewing on page load, so mail link scanners
  // can't approve or reject users by prefetching the link
  async function handleReview() {
    if (!token) return;

    setIsSubmitting(true);
    const { error } = await apiClient.api.mail["signup-review"].post({
      token,
      action,
    });
    setIsSubmitting(false);

    if (error) {
      const code = (error.value as { error?: string })?.error ?? "";
      toast.error(reviewErrors[code] ?? error.status + ": " + code);
      return;
    }

    setDone(true);
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:p-8">
        <h1 className="text-2xl font-bold">
          {action === "approve" ? "Nutzer zulassen" : "Nutzer ablehnen"}
        </h1>
        {done ? (
          <p className="text-sm text-balance text-muted-foreground">
            {action === "approve"
              ? "Der Nutzer wurde zugelassen und per E-Mail benachrichtigt."
              : "Der Nutzer wurde abgelehnt, gelöscht und per E-Mail benachrichtigt."}
          </p>
        ) : (
          <>
            <p className="text-sm text-balance text-muted-foreground">
              {action === "approve"
                ? "Der Nutzer kann sich danach anmelden."
                : "Der Account wird dabei gelöscht."}
            </p>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              disabled={!token || isSubmitting}
              onClick={handleReview}
            >
              {action === "approve" ? "Zulassen" : "Ablehnen"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewSignupScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <ReviewSignup />
        </Suspense>
      </div>
    </div>
  );
}
