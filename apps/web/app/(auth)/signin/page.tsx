import { SigninForm } from "@/components/signin-form";
import Image from "next/image";

export default function SigninScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="assets/logos/logo-konzern.light.svg"
            alt="Logo"
            width={100}
            height={100}
            className="block dark:hidden"
          />
          <Image
            src="assets/logos/logo-konzern.dark.svg"
            alt="Logo"
            width={100}
            height={100}
            className="hidden dark:block"
          />
        </div>
        <SigninForm />
      </div>
    </div>
  );
}
