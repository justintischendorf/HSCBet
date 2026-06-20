"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Inbox, LogOut } from "lucide-react";

export default function ScreensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="sm:py-10 py-10 sm:px-10 px-1">
        <div className="flex items-center justify-between">
          <Navbar />
          <div className="flex items-center sm:gap-2 gap-0.5">
            <Button variant="destructive" size="lg">
              <LogOut className="sm:hidden" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button variant="outline" size="lg">
              <Inbox />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
      <div>{children}</div>
    </ThemeProvider>
  );
}
