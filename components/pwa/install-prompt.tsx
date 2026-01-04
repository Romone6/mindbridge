"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const storageKey = "mb_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (window.localStorage.getItem(storageKey) === "1") return;

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(storageKey, "1");
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    window.localStorage.setItem(storageKey, "1");
    setIsVisible(false);
  };

  if (!isVisible || !promptEvent) return null;

  return (
    <Panel
      className="fixed bottom-6 left-6 z-40 w-full max-w-sm space-y-3 p-4 shadow-lg"
      role="dialog"
      aria-live="polite"
    >
      <div>
        <div className="text-sm font-semibold">Install MindBridge</div>
        <p className="text-xs text-muted-foreground">
          Add MindBridge to your home screen for faster access to our research and methodology resources.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleInstall}>
          Install app
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          Not now
        </Button>
      </div>
    </Panel>
  );
}
