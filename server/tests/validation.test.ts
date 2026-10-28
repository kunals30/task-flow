import { describe, expect, it } from "vitest";
import { parseFilters, parseId, validateTaskInput } from "../src/validation.js";
import { HttpError } from "../src/errors.js";

describe("validateTaskInput", () => {
  it("applies defaults and trims", () => {
    expect(validateTaskInput({ title: "  Write docs " })).toEqual({
      title: "Write docs", description: "", priority: "medium", status: "todo", dueDate: null,
    });
  });
  it("rejects missing title", () => {
    try { validateTaskInput({ title: " " }); expect.unreachable(); }
    catch (e) { expect((e as HttpError).status).toBe(400); expect((e as HttpError).details?.title).toBeDefined(); }
  });
  it("rejects invalid enum values and dates", () => {
    expect(() => validateTaskInput({ title: "x", priority: "urgent" })).toThrow(HttpError);
    expect(() => validateTaskInput({ title: "x", status: "done" })).toThrow(HttpError);
    expect(() => validateTaskInput({ title: "x", dueDate: "2026-02-30" })).toThrow(HttpError);
  });
  it("accepts a valid due date", () => {
    expect(validateTaskInput({ title: "x", dueDate: "2026-12-31" }).dueDate).toBe("2026-12-31");
  });
});

describe("parseId / parseFilters", () => {
  it("rejects non-integer ids", () => {
    expect(() => parseId("abc")).toThrow(HttpError);
    expect(() => parseId("0")).toThrow(HttpError);
    expect(parseId("7")).toBe(7);
  });
  it("validates filters", () => {
    expect(parseFilters({ status: "completed", search: " a " })).toEqual({ status: "completed", search: "a" });
    expect(() => parseFilters({ priority: "nope" })).toThrow(HttpError);
  });
});
