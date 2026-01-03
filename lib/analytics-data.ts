/**
 * Analytics data calculations for dashboard metrics
 */


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
    return 0;
}

export function getRiskBandDistribution(): {
    low: number;
    moderate: number;
    high: number;
    critical: number;
} {
    return {
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
    };
}

export function getAverageTimeToAction(): string {
    return "No data yet";
}

export function getAnalyticsData(): AnalyticsData {
    return {
        triagesThisWeek: getTriagesThisWeek(),
        riskBandDistribution: getRiskBandDistribution(),
        averageTimeToAction: getAverageTimeToAction()
    };
}
