'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Clinic, ClinicContextType, ClinicRole } from '@/types/clinic';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const userId = session?.user?.id;

    // Safety Timeout: Force loading to complete after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                console.warn("ClinicProvider: Loading timed out, forcing completion.");
                setIsLoading(false);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [isLoading]);

    const isClinicRole = (role: string): role is ClinicRole => {
        return role === 'OWNER' || role === 'CLINICIAN' || role === 'STAFF' || role === 'READ_ONLY';
    };

    const refreshClinics = useCallback(async () => {
        if (!userId) {
            setClinics([]);
            setCurrentClinic(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/clinics');
            if (!response.ok) {
                console.error('Error fetching clinics:', await response.text());
                setIsLoading(false);
                return;
            }

            const { clinics: apiClinics } = await response.json();

            const formattedClinics: Clinic[] = (apiClinics || [])
                .map((item: { id: string; name: string; role: string }) => ({
                    id: item.id,
                    name: item.name,
                    role: isClinicRole(item.role) ? item.role : 'CLINICIAN',
                }));

            setClinics(formattedClinics);

            // Auto-select logic
            if (formattedClinics.length > 0) {
                if (!currentClinic) {
                    // Try to restore from localStorage or pick first
                    // We need to access localStorage safely
                    let storedId = null;
                    if (typeof window !== 'undefined') {
                        storedId = localStorage.getItem('mindbridge_last_clinic_id');
                    }
                    
                    const match = formattedClinics.find(c => c.id === storedId);
                    const selected = match || formattedClinics[0];
                    setCurrentClinic(selected);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('mindbridge_last_clinic_id', selected.id);
                    }
                }
            } else {
                setCurrentClinic(null);
                // Redirect to onboarding if on dashboard
                // Check if we are already on onboarding to avoid loop
                if (pathname?.startsWith('/dashboard')) {
                    console.log("No clinics found. Redirecting to onboarding...");
                    router.push('/onboarding');
                }
            }
        } catch (err) {
            console.error('Failed to load clinics:', err);
            // Don't leave in infinite loading state on error
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }, [currentClinic, pathname, router, userId]);

    useEffect(() => {
        if (!isPending) {
            refreshClinics();
        }
    }, [isPending, refreshClinics]);

    const handleSetClinic = (clinic: Clinic) => {
        setCurrentClinic(clinic);
        if (typeof window !== 'undefined') {
            localStorage.setItem('mindbridge_last_clinic_id', clinic.id);
        }
    };

    return (
        <ClinicContext.Provider value={{
            clinics,
            currentClinic,
            isLoading,
            setCurrentClinic: handleSetClinic,
            refreshClinics
        }}>
            {children}
        </ClinicContext.Provider>
    );
}

export function useClinic() {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
}
