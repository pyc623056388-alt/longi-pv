"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages, type AppLocale } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "zh" ? "zh" : "en";
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<AppLocale>("en");

  useEffect(() => {
    setLocale(readStoredLocale());
  }, []);

  const handleLocaleChange = useCallback((next: AppLocale) => {
    setLocale(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const m = getMessages(locale).login;
  const isSignUp = pathname.startsWith("/sign-up");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#E40011]/20 via-[#E40011]/5 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-6">
        <Image
          src="/longi-logo.svg"
          alt="LONGi"
          width={86}
          height={40}
          priority
          className="h-8 w-auto"
        />
        <LanguageSwitcher
          locale={locale}
          onLocaleChange={handleLocaleChange}
          variant="hero"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {isSignUp ? m.signUpTitle : m.signInTitle}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {isSignUp ? m.signUpSubtitle : m.signInSubtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-1 shadow-2xl shadow-black/40">
          {children}
        </div>

        <p className="mt-5 text-center text-sm text-white/50">
          {isSignUp ? (
            <>
              {m.haveAccount}{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-[#ff8080] hover:text-white"
              >
                {m.goSignIn}
              </Link>
            </>
          ) : (
            <span>{m.inviteOnlyHint}</span>
          )}
        </p>
      </div>
    </div>
  );
}
