"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

const appearance = {
  variables: {
    colorPrimary: "#E40011",
    colorText: "#0f172a",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border-slate-200",
    formButtonPrimary:
      "bg-[#E40011] hover:bg-[#C4000F] text-white shadow-none",
    footerAction: "hidden",
  },
} as const;

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={appearance}
      />
    </AuthShell>
  );
}
