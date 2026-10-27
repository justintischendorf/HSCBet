"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { TwoFactorWarning } from "@/components/2fa-warning";
import Footer from "@/components/footer";
import { InboxPopover } from "@/components/inbox-popover";
import { ModeToggle } from "@/components/mode-toggle";
import { Navbar } from "@/components/navbar";
import NavbarAvatar from "@/components/navbar-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/use-socket";
import { authClient, useSession } from "@/lib/auth-client";
import { queryClient } from "@/lib/queryClient";

export default function ScreensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSession();
  const user = session?.data?.user;

  const { isConnected } = useSocket();

  async function handleLogout() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.status + ": " + error.message);
      return;
    }

    router.replace("/signin");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col">
        <div className="sm:pt-10 pt-6 sm:px-10 px-4 relative">
          <div className="flex flex-col md:flex-row md:relative items-center justify-between gap-2">
            <div className="order-2 md:order-1 w-full md:w-auto flex justify-center md:justify-start">
              <Navbar />
            </div>
            <Link
              href="/dashboard"
              className="order-1 md:order-2 flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            >
              <Image
                loading="eager"
                src="assets/logos/logo-hscbet.light.svg"
                alt="Logo"
                width={40}
                height={40}
                className="size-10 block dark:hidden"
              />
              <Image
                loading="eager"
                src="assets/logos/logo-hscbet.dark.svg"
                alt="Logo"
                width={40}
                height={40}
                className="size-10 hidden dark:block"
              />
            </Link>
            <div className="order-3 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-2 w-full sm:w-auto">
              {!user?.twoFactorEnabled && <TwoFactorWarning />}
              <Button variant="destructive" size="lg" onClick={handleLogout}>
                <LogOut className="sm:hidden" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              {user ? (
                <NavbarAvatar connected={isConnected} />
              ) : (
                <Skeleton className="h-8 w-8 rounded-full" />
              )}
              <InboxPopover />
              <ModeToggle />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex-1">{children}</div>
          <div className="sm:pb-16 pb-8">
            <Footer />
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}
