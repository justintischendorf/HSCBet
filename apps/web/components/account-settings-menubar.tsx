"use client";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

interface AccountSettingsMenubarProps {
  setActiveTab: (tab: "credentials" | "password" | "delete") => void;
}

export function AccountSettingsMenubar({
  setActiveTab,
}: AccountSettingsMenubarProps) {
  return (
    <Menubar className="w-94">
      <MenubarMenu>
        <MenubarTrigger onClick={() => setActiveTab("credentials")}>
          Konto aktualisieren
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger onClick={() => setActiveTab("password")}>
          Passwort ändern
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger onClick={() => setActiveTab("delete")}>
          Account löschen
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
