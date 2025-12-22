/**
 * Analytics data calculations for dashboard metrics
 */

import { PATIENTS } from "./mock-data";
import { calculateAverageTime, formatDuration } from "./time-utils";

export interface AnalyticsData {
    triagesThisWeek: number;
    riskBandDistribution: {
        low: number;
        moderate: number;
        high: number;
        critical: number;
    };
    averageTimeToAction: string;
}

export function getTriagesThisWeek(): number {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return PATIENTS.filter(patient => {
        const triageDate = new Date(patient.triaged_at);
        return triageDate >= oneWeekAgo;
    }).length;
}

export function getRiskBandDistribution(): {
    low: number;
    moderate: number;
    high: number;
    critical: number;
} {
    const total = PATIENTS.length;
    const counts = {
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
    };

    PATIENTS.forEach(patient => {
        const band = patient.risk_band.toLowerCase() as keyof typeof counts;
        if (band in counts) {
            counts[band]++;
        }
    });

    return {
        low: Math.round((counts.low / total) * 100),
        moderate: Math.round((counts.moderate / total) * 100),
        high: Math.round((counts.high / total) * 100),
        critical: Math.round((counts.critical / total) * 100)
    };
}

export function getAverageTimeToAction(): string {
    const avgMs = calculateAverageTime(PATIENTS);
    return formatDuration(avgMs);
}

export function getAnalyticsData(): AnalyticsData {
    return {
        triagesThisWeek: getTriagesThisWeek(),
        riskBandDistribution: getRiskBandDistribution(),
        averageTimeToAction: getAverageTimeToAction()
    };
}
