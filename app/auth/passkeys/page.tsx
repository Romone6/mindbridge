"use client";

import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

interface PasskeyItem {
  id: string;
  name?: string | null;
  createdAt?: string | null;
}

export default function PasskeysPage() {
  const { data: session, isPending } = authClient.useSession();
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPasskeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: listError } =
      await authClient.passkey.listUserPasskeys();
    if (listError) {
      setError(listError.message ?? "Failed to load passkeys.");
    }
    const mapped = (data || []).map((item) => ({
      id: item.id,
      name: item.name ?? null,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    }));
    setPasskeys(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadPasskeys();
    }
  }, [loadPasskeys, session?.user]);

  const handleAddPasskey = async () => {
    setIsLoading(true);
    setError(null);
    const { error: addError } = await authClient.passkey.addPasskey({
      name: "MindBridge Passkey",
    });
    if (addError) {
      setError(addError.message ?? "Failed to add passkey.");
    }
    await loadPasskeys();
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    const { error: deleteError } = await authClient.passkey.deletePasskey({ id });
    if (deleteError) {
      setError(deleteError.message ?? "Failed to delete passkey.");
    }
    await loadPasskeys();
  };

  return (
    <MainLayout showFooter={false}>
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <Panel className="p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">Passkeys</h1>
            <p className="text-sm text-muted-foreground">
              Add passkeys for quick, phishing-resistant sign-in.
            </p>
          </header>

          {!session?.user && !isPending && (
            <p className="text-sm text-muted-foreground">
              Sign in to manage your passkeys.
            </p>
          )}

          {session?.user && (
            <>
              <div className="flex items-center gap-3">
                <Button onClick={handleAddPasskey} disabled={isLoading}>
                  {isLoading ? "Working..." : "Add passkey"}
                </Button>
                <Button variant="outline" onClick={loadPasskeys} disabled={isLoading}>
                  Refresh
                </Button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="space-y-3">
                {passkeys.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No passkeys registered yet.
                  </p>
                )}

                {passkeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {passkey.name || "Unnamed passkey"}
                      </p>
                      {passkey.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(passkey.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(passkey.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </section>
    </MainLayout>
  );
}
