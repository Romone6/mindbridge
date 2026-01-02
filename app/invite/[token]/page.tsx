import { getInvite, acceptInvite } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { XCircle, ArrowRight, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const invite = await getInvite(token);
    const user = await currentUser();

    if (!invite) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <XCircle className="h-6 w-6" />
                            <span className="font-bold">Invalid Invitation</span>
                        </div>
                        <CardTitle>Invite Not Found</CardTitle>
                        <CardDescription>
                            This invitation link is invalid or has expired. Please ask your administrator for a new invite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="w-full">Return Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleAccept = async () => {
        "use server";
        await acceptInvite(token);
        redirect('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <MailIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Join {invite.clinic?.name}</CardTitle>
                    <CardDescription>
                        You have been invited to join this workspace as a <strong className="text-foreground">{invite.role}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {user ? (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
                                    {user.imageUrl ? (
                                        <Image 
                                            src={user.imageUrl} 
                                            alt={user.firstName || "User"} 
                                            width={40} 
                                            height={40} 
                                            className="h-10 w-10 rounded-full" 
                                        />
                                    ) : (
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Signed in as {user.primaryEmailAddress?.emailAddress}</p>
                                    <p className="text-xs text-muted-foreground">Not you? <SignOutButton><button className="underline hover:text-foreground">Sign out</button></SignOutButton></p>
                                </div>
                            </div>

                            <form action={handleAccept}>
                                <Button className="w-full" size="lg">
                                    Accept Invitation
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                                You must be signed in to accept this invitation.
                            </div>
                            <SignInButton mode="modal" forceRedirectUrl={`/invite/${token}`}>
                                <Button className="w-full" size="lg">
                                    Sign In / Create Account
                                </Button>
                            </SignInButton>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}
