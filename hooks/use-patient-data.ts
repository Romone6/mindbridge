"use client";

import { useState, useEffect, useMemo } from "react";
import { PATIENTS, Patient } from "@/lib/mock-data";

export interface PatientDataOptions {
    initialFilter?: string;
    refreshInterval?: number;
}

export function usePatientData({ initialFilter = "all" }: PatientDataOptions = {}) {
    const [riskFilter, setRiskFilter] = useState<string>(initialFilter);
    const [isLoading, setIsLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);

    // Simulate data fetching
    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            // In a real app, this would be a fetch call
            await new Promise(resolve => setTimeout(resolve, 500));
            setPatients(PATIENTS);
            setIsLoading(false);
        };

        fetchPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        return patients.filter(patient =>
            riskFilter === "all" || patient.risk_band === riskFilter
        );
    }, [patients, riskFilter]);

    const sortedPatients = useMemo(() => {
        return [...filteredPatients].sort((a, b) => b.risk_score - a.risk_score);
    }, [filteredPatients]);

    const updateFilter = (filter: string) => setRiskFilter(filter);

    return {
        patients: sortedPatients,
        totalCount: patients.length,
        filteredCount: sortedPatients.length,
        riskFilter,
        isLoading,
        updateFilter
    };
}
