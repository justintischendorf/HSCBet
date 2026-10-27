import { useSession } from "@/lib/auth-client";

// only for showing admin controls, the API checks the role on every request
export function useIsAdmin() {
  const session = useSession();
  return session.data?.user.role === "admin";
}
