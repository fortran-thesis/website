import {describe, it, expect, jest, beforeEach} from "@jest/globals";
import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import AssignCaseModal from "../../../components/modals/assign_case_modal";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => React.createElement("img", props),
}));

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => React.createElement("span", {"data-testid": "icon"}),
}));

describe("AssignCaseModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/v1/users/mycologists")) {
        return {
          ok: true,
          text: async () => JSON.stringify({
            success: true,
            data: {
              snapshot: [
                {id: "myc-1", details: {displayName: "Myco One"}},
              ],
            },
          }),
        } as any;
      }

      if (url.includes("/api/v1/mold-reports/assigned/count")) {
        return {
          ok: true,
          json: async () => ({data: {total: 0}}),
        } as any;
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    }) as any;
  });

  it("allows a weekend date and keeps the selected day stable", async () => {
    const onAssign = jest.fn();
    const onClose = jest.fn();

    render(
      <AssignCaseModal
        isOpen={true}
        onClose={onClose}
        onAssign={onAssign}
      />
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", {name: /choose mycologist/i}));
    fireEvent.click(await screen.findByRole("button", {name: /myco one \(0 cases\)/i}));

    const endDateInput = screen.getByLabelText(/set end date/i) as HTMLInputElement;
    fireEvent.change(endDateInput, {target: {value: "2026-05-02"}});

    expect(endDateInput).toHaveValue("2026-05-02");

    fireEvent.click(screen.getByRole("button", {name: /assign case/i}));

    expect(onAssign).toHaveBeenCalledWith(
      expect.objectContaining({id: "myc-1"}),
      "2026-05-02"
    );
    expect(onClose).toHaveBeenCalled();
  });
});