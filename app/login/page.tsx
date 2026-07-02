import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-[#E40011] animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
