import { PageShell } from "@/components/layout/page-shell";

interface MainLayoutProps {
    children: React.ReactNode;
    showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
    return <PageShell showFooter={showFooter}>{children}</PageShell>;
}
