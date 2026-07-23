/** Shared Clerk SignIn / SignUp appearance — full-width, centered in AuthShell */
export const clerkAuthAppearance = {
  variables: {
    colorPrimary: "#E40011",
    colorText: "#0f172a",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "mx-auto flex w-full max-w-full justify-center",
    cardBox: "mx-auto w-full max-w-full shadow-none",
    card: "mx-auto w-full max-w-full border-0 bg-transparent p-4 shadow-none sm:p-5",
    main: "w-full gap-4",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border-slate-200",
    formFieldInput:
      "w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-none",
    formButtonPrimary:
      "w-full bg-[#E40011] hover:bg-[#C4000F] text-white shadow-none rounded-xl",
    footer: "w-full",
    footerAction: "hidden",
  },
} as const;
