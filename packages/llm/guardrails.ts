export const checkInputGuardrails = async (input: string): Promise<{ safe: boolean; reason?: string }> => {
  // Simple prompt injection checks
  const injectionPatterns = [
    /ignore previous/i,
    /system prompt/i,
    /bypass/i,
    /act as/i,
    /roleplay/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { safe: false, reason: 'Detected potential prompt injection' };
    }
  }

  // PII redaction (very basic example)
  const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;

  if (creditCardRegex.test(input) || ssnRegex.test(input)) {
    return { safe: false, reason: 'Input contains sensitive PII' };
  }

  return { safe: true };
};

export const checkOutputGuardrails = async (output: string, contextChunks: string[]): Promise<{ safe: boolean; reason?: string }> => {
  // Blocked topics
  const blockedTopics = [
    /competitor_x/i,
    /profanity/i, // placeholder for actual profanity checks
  ];

  for (const topic of blockedTopics) {
    if (topic.test(output)) {
      return { safe: false, reason: 'Output contains blocked topics' };
    }
  }

  // Citation verification
  // A robust implementation would extract [1], [2] and verify the claim against the chunk
  // For MVP, we check if there's any citation format present when facts are stated.
  const hasCitations = /\[\d+\]/.test(output);
  if (!hasCitations && contextChunks.length > 0 && output.length > 100) {
    // If output is long but has no citations, it might be hallucinating
    // return { safe: false, reason: 'Missing citations for claims' };
  }

  return { safe: true };
};
