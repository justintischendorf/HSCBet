"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Inbox, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ScreensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.status + ": " + error.message);
      return;
    }

    router.replace("/signin");
  }
  return (
    <main>
      <div className="sm:py-10 py-10 sm:px-10 px-1">
        <div className="flex items-center justify-between">
          <Navbar />
          <div className="flex items-center sm:gap-2 gap-0.5">
            <Button variant="destructive" size="default" onClick={handleLogout}>
              <LogOut className="sm:hidden" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button variant="outline" size="icon">
              <Inbox />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
      <div>{children}</div>
    </main>
  );
}
