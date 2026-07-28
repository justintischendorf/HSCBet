import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function BackupAccordion() {
  const router = useRouter();
  const [backupCode, setBackupCode] = React.useState("");

  const handleVerify = async () => {
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code: backupCode,
    });

    if (error) {
      toast.error(error.message || "Fehler bei der Verifizierung");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-md border rounded-xl px-4"
    >
      <AccordionItem value="backup" className="border-none">
        <AccordionTrigger className="hover:no-underline">
          <span className="text-sm font-medium">
            Kein Zugriff auf den Authenticator?
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gib einen deiner Backup-Codes ein, um dich wieder anzumelden.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="z.B. ABC-123-DEF"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              className="flex-1 ml-1"
            />
            <Button onClick={handleVerify} variant="secondary">
              Verifizieren
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
