"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
    DEFAULT_ROLE,
    LandingRole,
    parseLandingRole,
    persistStoredRole,
    readStoredRole,
    resolveLandingRole,
} from "@/lib/landing-role-content";

type LandingRoleContextValue = {
    role: LandingRole;
    setRole: (role: LandingRole) => void;
    queryRole: LandingRole | null;
};

const LandingRoleContext = createContext<LandingRoleContextValue | undefined>(undefined);

export function LandingRoleProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const queryRole = useMemo(() => parseLandingRole(searchParams?.get("role")), [searchParams]);
    const storedRole = useSyncExternalStore(
        (onStoreChange) => {
            if (typeof window === "undefined") return () => undefined;
            const handler = () => onStoreChange();
            window.addEventListener("storage", handler);
            return () => window.removeEventListener("storage", handler);
        },
        () => (typeof window === "undefined" ? null : readStoredRole(window.localStorage)),
        () => null
    );
    const [selectedRole, setSelectedRole] = useState<LandingRole | null>(null);

    const role = useMemo(
        () =>
            resolveLandingRole({
                queryRole,
                storedRole: selectedRole ?? storedRole ?? DEFAULT_ROLE,
            }),
        [queryRole, selectedRole, storedRole]
    );

    const setRole = useCallback((nextRole: LandingRole) => {
        setSelectedRole(nextRole);
        persistStoredRole(typeof window === "undefined" ? null : window.localStorage, nextRole);
    }, []);

    const value = useMemo(
        () => ({
            role,
            setRole,
            queryRole,
        }),
        [queryRole, role, setRole]
    );

    return <LandingRoleContext.Provider value={value}>{children}</LandingRoleContext.Provider>;
}

export function useLandingRole() {
    const context = useContext(LandingRoleContext);
    if (!context) {
        throw new Error("useLandingRole must be used within LandingRoleProvider");
    }
    return context;
}
