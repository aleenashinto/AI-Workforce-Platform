import { describe, it, expect } from "vitest";
import { authorize, enforce } from "./index";

describe("authz", () => {
  describe("authorize()", () => {
    it("returns false for unknown roles", () => {
      expect(authorize(["hacker"], "MANAGE_BILLING")).toBe(false);
    });

    it("returns false for empty roles", () => {
      expect(authorize([], "MANAGE_BILLING")).toBe(false);
    });

    it("returns true when user has owner role", () => {
      expect(authorize(["owner"], "MANAGE_BILLING")).toBe(true);
      expect(authorize(["owner"], "READ_CONVERSATIONS")).toBe(true);
    });

    it("returns true when user has one valid role among many", () => {
      expect(
        authorize(["viewer", "support_agent"], "RESPOND_TO_CONVERSATIONS"),
      ).toBe(true);
    });

    it("returns false when user has no valid roles", () => {
      expect(authorize(["viewer", "support_agent"], "APPROVE_DRAFT")).toBe(
        false,
      );
    });

    it("allows sales_lead to approve drafts", () => {
      expect(authorize(["sales_lead"], "APPROVE_DRAFT")).toBe(true);
    });

    it("denies sales_rep from approving drafts", () => {
      expect(authorize(["sales_rep"], "APPROVE_DRAFT")).toBe(false);
    });
  });

  describe("enforce()", () => {
    it("throws if unauthorized", () => {
      expect(() => enforce(["viewer"], "MANAGE_BILLING")).toThrowError(
        "Unauthorized",
      );
    });

    it("does not throw if authorized", () => {
      expect(() => enforce(["owner"], "MANAGE_BILLING")).not.toThrow();
    });
  });
});
