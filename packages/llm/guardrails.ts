export const checkInputGuardrails = async (
  input: string,
): Promise<{ safe: boolean; reason?: string; sanitized?: string }> => {
  // Simple prompt injection checks
  const injectionPatterns = [
    /ignore previous/i,
    /system prompt/i,
    /bypass/i,
    /act as/i,
    /roleplay/i,
    /forget all instructions/i,
    /disregard previous/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { safe: false, reason: "Detected potential prompt injection" };
    }
  }

  // PII redaction
  const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  let sanitized = input;
  let redacted = false;

  if (creditCardRegex.test(sanitized)) {
    sanitized = sanitized.replace(creditCardRegex, "[REDACTED_CC]");
    redacted = true;
  }
  if (ssnRegex.test(sanitized)) {
    sanitized = sanitized.replace(ssnRegex, "[REDACTED_SSN]");
    redacted = true;
  }
  if (emailRegex.test(sanitized)) {
    sanitized = sanitized.replace(emailRegex, "[REDACTED_EMAIL]");
    redacted = true;
  }

  return { safe: true, sanitized: redacted ? sanitized : input };
};

export const checkOutputGuardrails = async (
  output: string,
  contextChunks: string[],
): Promise<{ safe: boolean; reason?: string }> => {
  // Blocked topics
  const blockedTopics = [
    /competitor_x/i,
    /profanity/i, // placeholder for actual profanity checks
  ];

  for (const topic of blockedTopics) {
    if (topic.test(output)) {
      return { safe: false, reason: "Output contains blocked topics" };
    }
  }

  // Citation verification
  const hasCitations = /\[\d+\]/.test(output);
  if (!hasCitations && contextChunks.length > 0 && output.length > 100) {
    // Flag if missing citations
  }

  return { safe: true };
};
