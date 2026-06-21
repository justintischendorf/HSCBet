"use client";

import { useSession } from "@/lib/auth-client";

export default function DashboardScreen() {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <main className="sm:py-10 py-6 sm:px-10 px-4">
      <p className="font-bold">Hallo, {user?.name}!</p>
      <p>Dashboard Screen</p>
    </main>
  );
}
