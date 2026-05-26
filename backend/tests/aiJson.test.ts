import { describe, expect, it } from "vitest";
import { parseJsonObject } from "../src/services/ai/json.js";

describe("AI JSON parser", () => {
  it("parses plain JSON", () => {
    expect(parseJsonObject('{"ok":true}')).toEqual({ ok: true });
  });

  it("parses fenced JSON", () => {
    expect(parseJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("rejects malformed JSON", () => {
    expect(() => parseJsonObject("{bad")).toThrow();
  });
});
