import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getActors } from "../services/actor.api";
import { actors } from "../test/fixtures";
import { ActorSelect } from "./ActorSelect";

vi.mock("../services/actor.api", () => ({
  getActors: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getActors).mockResolvedValue(actors);
});

describe("ActorSelect", () => {
  test("loads actors and selects the first actor by default", async () => {
    const onChange = vi.fn();

    render(<ActorSelect value="" onChange={onChange} />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("john-doe");
  });

  test("notifies when actor selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ActorSelect value="john-doe" onChange={onChange} />);

    await screen.findByText("John Doe");
    await user.selectOptions(screen.getByRole("combobox"), "jane-smith");

    expect(onChange).toHaveBeenCalledWith("jane-smith");
  });
});
