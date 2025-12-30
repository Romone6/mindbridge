export type ClinicRole = 'OWNER' | 'CLINICIAN' | 'STAFF' | 'READ_ONLY';

export type Clinic = {
    id: string;
    name: string;
    role: ClinicRole;
};

export type ClinicContextType = {
    clinics: Clinic[];
    currentClinic: Clinic | null;
    isLoading: boolean;
    setCurrentClinic: (clinic: Clinic) => void;
    refreshClinics: () => Promise<void>;
};
