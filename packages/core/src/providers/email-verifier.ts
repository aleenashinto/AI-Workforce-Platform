export interface EmailVerificationResult {
  email: string;
  status: "valid" | "risky" | "invalid" | "unknown";
  reason?: string;
}

export interface EmailVerificationProvider {
  verify(email: string): Promise<EmailVerificationResult>;
}

export class ZeroBounceMockProvider implements EmailVerificationProvider {
  async verify(email: string): Promise<EmailVerificationResult> {
    console.log(`[ZeroBounceProvider] Verifying email: ${email}`);

    // Simple deterministic mock logic
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes("invalid") || lowerEmail.includes("bounce")) {
      return { email, status: "invalid", reason: "Hard bounce" };
    }

    if (lowerEmail.includes("catchall") || lowerEmail.includes("sales@")) {
      return { email, status: "risky", reason: "Catch-all address" };
    }

    return { email, status: "valid" };
  }
}
