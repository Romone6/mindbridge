'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { Clinic, ClinicContextType, ClinicRole } from '@/types/clinic';
import { useRouter, usePathname } from 'next/navigation';

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
    const { getToken, isLoaded, userId } = useAuth();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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
            const token = await getToken({ template: 'supabase' });
            if (!token) {
                // If no token, maybe not fully authenticated or no template setup
                // We'll retry or just return empty for now
                // console.warn("No Supabase token from Clerk");
                setIsLoading(false);
                return;
            }

            const supabase = createClerkSupabaseClient(token);
            if (!supabase) return;

            // Fetch memberships and join clinics
            const { data, error } = await supabase
                .from('clinic_memberships')
                .select('role, clinic:clinics(id, name)');

            if (error) {
                console.error('Error fetching clinics:', error);
                // If table doesn't exist yet, we might get an error. 
                // We should handle this gracefully during migration phase.
                setIsLoading(false);
                return;
            }
            
            type MembershipRow = {
                role: string;
                clinic: {
                    id: string;
                    name: string;
                } | null; // clinic might be null if join fails (though inner join shouldn't)
            };

            const formattedClinics: Clinic[] = ((data as unknown as MembershipRow[]) || [])
                .filter(item => item.clinic) // Ensure clinic exists
                .map((item) => ({
                    id: item.clinic!.id,
                    name: item.clinic!.name,
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
    }, [currentClinic, getToken, pathname, router, userId]);

    useEffect(() => {
        if (isLoaded) {
            refreshClinics();
        }
    }, [isLoaded, refreshClinics]);

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
