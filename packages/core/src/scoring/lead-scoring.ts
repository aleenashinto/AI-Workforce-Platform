export interface LeadScoreInput {
  isCompetitor?: boolean;
  isExistingCustomer?: boolean;
  onSuppressionList?: boolean;
  isEmployeeCountOutsideICP?: boolean;
  isBlockedGeo?: boolean;
  
  fit_firmographic: number; // 0-100
  fit_persona: number; // 0-100
  signal_strength: number; // 0-100
}

export interface ScoreReason {
  factor: string;
  contribution: number;
  explanation: string;
}

export interface LeadScoreResult {
  score: number;
  reasons: ScoreReason[];
}

export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  const reasons: ScoreReason[] = [];

  // Disqualifiers force score to 0
  if (input.isCompetitor) {
    return { score: 0, reasons: [{ factor: 'disqualifier', contribution: 0, explanation: 'Lead works for a competitor' }] };
  }
  if (input.isExistingCustomer) {
    return { score: 0, reasons: [{ factor: 'disqualifier', contribution: 0, explanation: 'Company is an existing customer' }] };
  }
  if (input.onSuppressionList) {
    return { score: 0, reasons: [{ factor: 'disqualifier', contribution: 0, explanation: 'Lead or domain is on the suppression list' }] };
  }
  if (input.isEmployeeCountOutsideICP) {
    return { score: 0, reasons: [{ factor: 'disqualifier', contribution: 0, explanation: 'Company employee count falls outside ICP band' }] };
  }
  if (input.isBlockedGeo) {
    return { score: 0, reasons: [{ factor: 'disqualifier', contribution: 0, explanation: 'Company is located in a blocked geography' }] };
  }

  // Weighted formula:
  // fit_firmographic (0.40), fit_persona (0.40), signal_strength (0.20)
  const weightFirmographic = 0.40;
  const weightPersona = 0.40;
  const weightSignal = 0.20;

  const scoreFirmographic = Math.round(input.fit_firmographic * weightFirmographic);
  const scorePersona = Math.round(input.fit_persona * weightPersona);
  const scoreSignal = Math.round(input.signal_strength * weightSignal);

  const totalScore = Math.min(100, Math.max(0, scoreFirmographic + scorePersona + scoreSignal));

  reasons.push({ factor: 'fit_firmographic', contribution: scoreFirmographic, explanation: `Firmographic fit scored ${input.fit_firmographic}/100 based on industry and size` });
  reasons.push({ factor: 'fit_persona', contribution: scorePersona, explanation: `Persona fit scored ${input.fit_persona}/100 based on title and seniority` });
  reasons.push({ factor: 'signal_strength', contribution: scoreSignal, explanation: `Signal strength scored ${input.signal_strength}/100 based on observed timing and events` });

  return {
    score: totalScore,
    reasons
  };
}
