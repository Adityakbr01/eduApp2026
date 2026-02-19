export function calculateDynamicPenalty(daysLate: number): number {
    const PENALTY_PER_DAY = 5; // 5% per day
    const MAX_PENALTY = 30;    // Max 30%

    if (daysLate <= 0) return 0;

    const calculated = daysLate * PENALTY_PER_DAY;

    return Math.min(calculated, MAX_PENALTY);
}


export function resolvePenalty(
    daysLate: number,
    dbPenaltyPercent?: number | null
): number {

    // If DB explicitly defined penalty → use it
    if (typeof dbPenaltyPercent === "number" && dbPenaltyPercent > 0) {
        return dbPenaltyPercent;
    }

    // Otherwise calculate dynamically
    return calculateDynamicPenalty(daysLate);
}
