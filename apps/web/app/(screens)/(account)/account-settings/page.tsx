"use client";

import { useState } from "react";
import { AccountCredentialsCard } from "@/components/account-credentials-card";
import { AccountPasswordCard } from "@/components/account-password-card";
import { AccountSettingsMenubar } from "@/components/account-settings-menubar";
import AccountDeleteCard from "@/components/account-delete-card";

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<
    "credentials" | "password" | "delete"
  >("credentials");

  return (
    <main className="sm:py-10 py-6 sm:px-10 px-4">
      <div className="flex flex-col justify-center items-center sm:gap-10 gap-6">
        <AccountSettingsMenubar setActiveTab={setActiveTab} />
        {activeTab === "credentials" && <AccountCredentialsCard />}
        {activeTab === "password" && <AccountPasswordCard />}
        {activeTab === "delete" && <AccountDeleteCard />}
      </div>
    </main>
  );
}
