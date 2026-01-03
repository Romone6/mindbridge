import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/landing/footer";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
  mainClassName?: string;
  containerClassName?: string;
}

export function PageShell({
  children,
  showFooter = true,
  mainClassName,
  containerClassName,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className={cn("flex-1 py-8 sm:py-10", mainClassName)}>
        <div className={cn("page-container", containerClassName)}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
