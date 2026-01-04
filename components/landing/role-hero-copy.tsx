import { LandingRole, ROLE_CONTENT } from "@/lib/landing-role-content";

export function RoleHeroCopy({ role }: { role: LandingRole }) {
    const content = ROLE_CONTENT[role];

    return (
        <>
            <h1>{content.headline}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{content.subheadline}</p>
        </>
    );
}
