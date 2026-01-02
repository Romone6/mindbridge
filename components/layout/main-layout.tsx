import { AnimatedNavbar } from "@/components/ui/animated-navbar";
import { Footer } from "@/components/landing/footer";

interface MainLayoutProps {
    children: React.ReactNode;
    showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <AnimatedNavbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
}
