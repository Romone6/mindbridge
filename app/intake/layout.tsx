export default function IntakeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="h-16 border-b border-border flex items-center justify-center">
                 <div className="flex items-center gap-2 font-mono text-sm tracking-widest font-bold uppercase">
                    <div className="h-4 w-4 bg-primary" />
                    MindBridge_Intake
                </div>
            </header>
            <main className="max-w-2xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
