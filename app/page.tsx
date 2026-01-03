import { MainLayout } from "@/components/layout/main-layout";
import { SignalChamberLanding } from "@/components/landing/signal-chamber";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <MainLayout showFooter={false}>
        <main className="flex flex-col">
          <SignalChamberLanding />
        </main>
      </MainLayout>
    </div>
  );
}
