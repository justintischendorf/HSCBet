'use client';

import { useEffect, useRef, useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';
import { Inbox, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import React from 'react';
import Footer from '@/components/footer';
import { TwoFactorWarning } from '@/components/2fa-warning';

export default function ScreensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const user = session?.data?.user;

  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/api/socket';

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
      } catch (err) {
        toast.error('Fehler beim Verarbeiten der WebSocket-Nachricht:' + err);
      }
    };

    socket.onerror = (error) => {
      console.log('WebSocket-Fehler:', error);
    };

    socket.onclose = (event) => {
      setIsConnected(false);
    };

    wsRef.current = socket;

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, []);

  async function handleLogout() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.status + ': ' + error.message);
      return;
    }

    router.replace('/signin');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="sm:pt-10 pt-6 sm:px-10 px-4 relative">
        <div className="flex items-center justify-center mb-6">
          <Image
            loading="eager"
            src="assets/logos/logo.light.svg"
            alt="Logo"
            width={40}
            height={40}
            className="block dark:hidden"
          />
          <Image
            loading="eager"
            src="assets/logos/logo.dark.svg"
            alt="Logo"
            width={40}
            height={40}
            className="hidden dark:block"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="w-full sm:w-auto flex justify-center sm:justify-start">
            <Navbar />
          </div>
          <div className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-2 w-full sm:w-auto">
            {isConnected ? (
              <div className="animate-pulse h-3 w-3 rounded-full bg-positive shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            ) : (
              <div className="animate-pulse h-3 w-3 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            )}
            {!user?.twoFactorEnabled && <TwoFactorWarning />}
            <Button variant="destructive" size="default" onClick={handleLogout}>
              <LogOut className="sm:hidden" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button variant="outline" size="icon">
              <Inbox className="h-5 w-5" />
            </Button>
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
  );
}
