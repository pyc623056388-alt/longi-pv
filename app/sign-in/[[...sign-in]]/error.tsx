"use client";

export default function SignInError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
      <h1 className="text-xl font-bold">登录页加载失败</h1>
      <p className="mt-2 max-w-md text-sm text-white/60">
        {error.message || "Unknown error"}
      </p>
      {error.digest ? (
        <p className="mt-1 text-xs text-white/40">digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[#E40011] px-4 py-2 text-sm font-semibold"
      >
        重试
      </button>
    </div>
  );
}
