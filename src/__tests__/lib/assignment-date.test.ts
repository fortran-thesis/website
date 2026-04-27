import {describe, it, expect} from "@jest/globals";
import {serializeAssignmentDateInput} from "@/lib/assignment-date";

describe("serializeAssignmentDateInput", () => {
  it("serializes a date input without shifting the calendar day", () => {
    expect(serializeAssignmentDateInput("2026-05-02")).toBe("2026-05-02T00:00:00.000Z");
  });

  it("returns undefined for empty values", () => {
    expect(serializeAssignmentDateInput(undefined)).toBeUndefined();
    expect(serializeAssignmentDateInput(null)).toBeUndefined();
  });
});