"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMessages, type AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "zh" ? "zh" : "en";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const configError = searchParams.get("error") === "config";

  const [locale, setLocale] = useState<AppLocale>("en");
  const [code, setCode] = useState("");
  const [error, setError] = useState<"invalid" | "server" | "config" | null>(
    configError ? "config" : null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocale(readStoredLocale());
  }, []);

  const m = getMessages(locale).login;

  const handleLocaleChange = useCallback((next: AppLocale) => {
    setLocale(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (res.ok) {
        router.replace(redirectTo.startsWith("/") ? redirectTo : "/");
        router.refresh();
        return;
      }

      if (res.status === 401) {
        setError("invalid");
      } else if (res.status === 500) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error === "config" ? "config" : "server");
      } else {
        setError("server");
      }
    } catch {
      setError("server");
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage =
    error === "invalid"
      ? m.invalidCode
      : error === "config"
        ? m.configError
        : error === "server"
          ? m.serverError
          : null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#E40011]/20 via-[#E40011]/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#E40011]/10 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/longi-logo.svg"
          alt="LONGi"
          width={86}
          height={40}
          priority
          className="h-8 w-auto md:h-10"
        />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher
          locale={locale}
          onLocaleChange={handleLocaleChange}
          variant="hero"
        />
      </div>

      <Card className="relative z-10 w-full max-w-md border-slate-200/80 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-extrabold text-slate-900">
            {m.title}
          </CardTitle>
          <CardDescription className="text-slate-500 text-base">
            {m.subtitle}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-slate-700">
                {m.codeLabel}
              </Label>
              <Input
                id="access-code"
                name="code"
                type="text"
                autoComplete="off"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={submitting}
                aria-invalid={error === "invalid"}
                className="h-12 rounded-xl text-base tracking-wide"
              />
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
              >
                {errorMessage}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={submitting || !code.trim()}
              className="w-full h-12 rounded-2xl text-base font-semibold bg-gradient-to-r from-[#E40011] to-[#ff4d5a] text-white hover:opacity-90 border-0 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {m.submitting}
                </>
              ) : (
                m.submit
              )}
            </Button>
            <p className="text-xs text-center text-slate-400">{m.footer}</p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
