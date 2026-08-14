export interface LeadScoreInput {
  isCompetitor?: boolean;
  isExistingCustomer?: boolean;
  onSuppressionList?: boolean;
  isEmployeeCountOutsideICP?: boolean;
  isBlockedGeo?: boolean;
  
  fit_firmographic: number; // 0-100
  fit_persona: number; // 0-100
  signal_strength: number; // 0-100
  tech_fit: number; // 0-100
  contactability: number; // 0-100
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
  // fit_firmographic (0.25), fit_persona (0.20), signal_strength (0.25), tech_fit (0.15), contactability (0.15)
  const weightFirmographic = 0.25;
  const weightPersona = 0.20;
  const weightSignal = 0.25;
  const weightTech = 0.15;
  const weightContactability = 0.15;

  const scoreFirmographic = Math.round(input.fit_firmographic * weightFirmographic);
  const scorePersona = Math.round(input.fit_persona * weightPersona);
  const scoreSignal = Math.round(input.signal_strength * weightSignal);
  const scoreTech = Math.round(input.tech_fit * weightTech);
  const scoreContactability = Math.round(input.contactability * weightContactability);

  const totalScore = Math.min(100, Math.max(0, scoreFirmographic + scorePersona + scoreSignal + scoreTech + scoreContactability));

  reasons.push({ factor: 'fit_firmographic', contribution: scoreFirmographic, explanation: `Firmographic fit scored ${input.fit_firmographic}/100 based on industry and size` });
  reasons.push({ factor: 'fit_persona', contribution: scorePersona, explanation: `Persona fit scored ${input.fit_persona}/100 based on title and seniority` });
  reasons.push({ factor: 'signal_strength', contribution: scoreSignal, explanation: `Signal strength scored ${input.signal_strength}/100 based on observed timing and events` });
  reasons.push({ factor: 'tech_fit', contribution: scoreTech, explanation: `Tech stack fit scored ${input.tech_fit}/100 based on used technologies` });
  reasons.push({ factor: 'contactability', contribution: scoreContactability, explanation: `Contactability scored ${input.contactability}/100 based on email status and presence` });

  return {
    score: totalScore,
    reasons
  };
}
