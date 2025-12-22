/**
 * Time utility functions for calculating and formatting time differences
 */

export function getTimeSinceTriage(timestamp: string): string {
    const now = new Date();
    const triageTime = new Date(timestamp);
    const diffMs = now.getTime() - triageTime.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ago`;
    } else {
        return `${minutes}m ago`;
    }
}

export function formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
        return `${minutes}m`;
    }
}

export function calculateAverageTime(sessions: Array<{ triaged_at: string; actioned_at?: string }>): number {
    const actionedSessions = sessions.filter(s => s.actioned_at);

    if (actionedSessions.length === 0) {
        return 0;
    }

    const totalMs = actionedSessions.reduce((sum, session) => {
        const triageTime = new Date(session.triaged_at).getTime();
        const actionTime = new Date(session.actioned_at!).getTime();
        return sum + (actionTime - triageTime);
    }, 0);

    return totalMs / actionedSessions.length;
}
