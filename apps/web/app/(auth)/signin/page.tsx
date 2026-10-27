import Image from "next/image";

import { SigninForm } from "@/components/signin-form";

export default function SigninScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex items-center justify-center">
          <Image
            loading="eager"
            src="assets/logos/logo-hscbet-full.light.svg"
            alt="Logo"
            width={200}
            height={200}
            className="size-40 block dark:hidden"
          />
          <Image
            loading="eager"
            src="assets/logos/logo-hscbet-full.dark.svg"
            alt="Logo"
            width={200}
            height={200}
            className="size-40 hidden dark:block"
          />
        </div>
        <SigninForm />
      </div>
    </div>
  );
}
