import Image from "next/image";

import { SignupForm } from "@/components/signup-form";

export default function SignupScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex items-center justify-center mb-6">
          <Image
            loading="eager"
            src="assets/logos/logo-hscbet.light.svg"
            alt="Logo"
            width={100}
            height={100}
            className="size-25 block dark:hidden"
          />
          <Image
            loading="eager"
            src="assets/logos/logo-hscbet.dark.svg"
            alt="Logo"
            width={100}
            height={100}
            className="size-25 hidden dark:block"
          />
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
