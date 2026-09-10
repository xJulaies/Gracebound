import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivacyPage } from "./PrivacyPage";

describe("PrivacyPage", () => {
  it("identifies its German content language", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("main")).toHaveAttribute("lang", "de");
  });
});
