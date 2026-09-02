import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = "night";
});

describe("ThemeToggle", () => {
  it("switches and persists the active theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: "Switch to grace theme" });
    expect(toggle).toHaveTextContent("Night");

    await user.click(toggle);

    expect(document.documentElement.dataset.theme).toBe("grace");
    expect(localStorage.getItem("gracebound-theme")).toBe("grace");
    expect(
      screen.getByRole("button", { name: "Switch to night theme" }),
    ).toHaveTextContent("Grace");
  });
});
