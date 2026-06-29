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
        <p className="text-base text-muted-foreground mt-2">
          Hier kannst du deine Kontoeinstellungen verwalten, einschließlich
          Anmeldeinformationen, Passwortänderungen und Kontolöschung.
        </p>

        <Separator className="sm:my-8 my-6" />

        <div className="flex flex-col gap-6 md:gap-8">
          {/* Menüleiste */}
          <div className="w-full flex justify-start">
            <AccountSettingsMenubar
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          </div>

          {/* Container für die Tabs im 2FA-Karten-Design */}
          <div className="w-full animate-in fade-in duration-300 ease-in-out">
            {activeTab === 'credentials' && (
              <div className="flex flex-col border border-border rounded-lg p-4 sm:p-6 gap-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">Persönliche Daten</h2>
                  <p className="text-sm text-muted-foreground">
                    Passe deinen Namen, deine E-Mail und weitere Profildaten an.
                  </p>
                </div>
                {/* WICHTIG: Die Card selbst sollte keinen eigenen Rahmen mehr haben,
                    sondern nur noch die Eingabefelder enthalten */}
                <AccountCredentialsCard />
              </div>
            )}

            {activeTab === 'password' && (
              <div className="flex flex-col border border-border rounded-lg p-4 sm:p-6 gap-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">Passwort ändern</h2>
                  <p className="text-sm text-muted-foreground">
                    Aktualisiere dein Passwort, um dein Konto abzusichern.
                  </p>
                </div>
                <AccountPasswordCard />
              </div>
            )}

            {activeTab === 'delete' && (
              <div className="flex flex-col border border-destructive/30 bg-destructive/5 rounded-lg p-4 sm:p-6 gap-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-destructive">
                    Gefahrenzone
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sobald du dein Konto löschst, gibt es kein Zurück mehr.
                    Bitte sei dir sicher.
                  </p>
                </div>
                <AccountDeleteCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
