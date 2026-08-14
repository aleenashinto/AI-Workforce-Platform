/**
 * Calculates the max allowed emails per day for a mailbox in warmup.
 * Schedule: 5 -> 10 -> 20 -> 40 over 4 weeks (each stage is 1 week).
 */
export class WarmupCalculator {
  static getWarmupCap(createdAt: Date): number {
    const daysActive = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysActive < 7) return 5;
    if (daysActive < 14) return 10;
    if (daysActive < 21) return 20;
    if (daysActive < 28) return 40;
    
    return 1000; // Post-warmup, effectively unbound by warmup logic (daily_cap wins)
  }

  static getEffectiveCap(createdAt: Date, configuredDailyCap: number): number {
    const warmupCap = this.getWarmupCap(createdAt);
    return Math.min(warmupCap, configuredDailyCap);
  }
}
