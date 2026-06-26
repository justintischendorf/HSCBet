'use client';

import { useState } from 'react';
import { AccountCredentialsCard } from '@/components/account-credentials-card';
import { AccountPasswordCard } from '@/components/account-password-card';
import { AccountSettingsMenubar } from '@/components/account-settings-menubar';
import AccountDeleteCard from '@/components/account-delete-card';
import { Separator } from '@/components/ui/separator';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<
    'credentials' | 'password' | 'delete'
  >('credentials');

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          Konto-Einstellungen
        </h1>
        <p className="text-base">
          Verwalte deine persönlichen Daten, Sicherheitseinstellungen und dein
          Konto.
        </p>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="w-full flex justify-start">
            <AccountSettingsMenubar
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          </div>

          <div className="w-full">
            {activeTab === 'credentials' && <AccountCredentialsCard />}
            {activeTab === 'password' && <AccountPasswordCard />}
            {activeTab === 'delete' && <AccountDeleteCard />}
          </div>
        </div>
      </div>
    </main>
  );
}
