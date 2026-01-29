"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="link"
      size="sm"
      className={className}
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
    >
      Sign out
    </Button>
  );
}
