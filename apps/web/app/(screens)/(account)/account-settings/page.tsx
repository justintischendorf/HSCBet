'use client';

import { AccountCredentialsCard } from '@/components/account-credentials-card';
import { AccountPasswordCard } from '@/components/account-password-card';
import AccountDeleteCard from '@/components/account-delete-card';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountSettings() {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          Konto-Einstellungen
        </h1>
        <p className="text-base">
          Hier kannst du deine Kontoeinstellungen verwalten, einschließlich
          Anmeldeinformationen, Passwortänderungen und Kontolöschung.
        </p>
        <Separator className="sm:my-8 my-6" />
        {!user ? (
          <Skeleton className="w-full h-257.75 sm:h-133 rounded-xl" />
        ) : (
          <div className="w-full flex sm:flex-row flex-col justify-center gap-5">
            <AccountCredentialsCard user={user} />
            <div className="flex flex-col gap-5 flex-3">
              <AccountPasswordCard />
              <AccountDeleteCard />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
