'use client';

import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';

interface AccountSettingsMenubarProps {
  activeTab: 'credentials' | 'password' | 'delete';
  setActiveTab: (tab: 'credentials' | 'password' | 'delete') => void;
}

export function AccountSettingsMenubar({
  activeTab,
  setActiveTab,
}: AccountSettingsMenubarProps) {
  return (
    <Menubar className="w-84">
      <MenubarMenu>
        <MenubarTrigger
          onClick={() => setActiveTab('credentials')}
          className={activeTab === 'credentials' ? 'bg-muted' : ''}
        >
          Konto Informationen
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger
          onClick={() => setActiveTab('password')}
          className={activeTab === 'password' ? 'bg-muted' : ''}
        >
          Passwort
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger
          onClick={() => setActiveTab('delete')}
          className={activeTab === 'delete' ? 'bg-muted' : ''}
        >
          Account
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
