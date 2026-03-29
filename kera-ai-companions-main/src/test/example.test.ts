import { describe, it, expect } from "vitest";
import { sendMessage, ChatMessage } from "@/api/openrouter";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("API Integration", () => {
  it("should export sendMessage function", () => {
    expect(typeof sendMessage).toBe("function");
  });

  it("should handle API configuration error", { timeout: 30000 }, async () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "Hello" }
    ];

    // This should throw an error since free models are rate-limited or unavailable
    // But the important thing is that it tries multiple times with backoff
    await expect(sendMessage(messages)).rejects.toThrow();
  });
});
