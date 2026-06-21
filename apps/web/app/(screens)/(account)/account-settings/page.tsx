import { AccountCredentialsCard } from "@/components/account-credentials-card";
import { PasswordCard } from "@/components/password-card";

export default function AccountSettings() {
  return (
    <main className="sm:py-10 py-6 sm:px-10 px-4">
      <div className="sm:mb-8 mb-2">
        <h1 className="sm:text-3xl text-xl font-bold">
          Verwalten Sie Ihren Account ...
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center gap-10">
        <AccountCredentialsCard />
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 bg-destructive h-0.5"></div>
          <p className="text-destructive whitespace-nowrap">Danger Zone</p>
          <div className="flex-1 bg-destructive h-0.5"></div>
        </div>

        <PasswordCard />
      </div>
    </main>
  );
}
