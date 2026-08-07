"use client";

import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function AccountUserButton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 ring-1 ring-white/25",
            userButtonPopoverCard: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
