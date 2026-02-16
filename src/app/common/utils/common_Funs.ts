export function isCurrentTimeGreaterThan(givenTime: number): boolean {
    const currentTime = Date.now();
    return currentTime > givenTime;
}