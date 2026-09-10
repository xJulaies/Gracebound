import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";

vi.mock("./organisms/HomeHero", () => ({
  HomeHero: () => <div>Home hero</div>,
}));
vi.mock("../../legal/components/molecules/FanProjectDisclaimer", () => ({
  FanProjectDisclaimer: () => <div>Fan project disclaimer</div>,
}));
vi.mock("../../builds/components/organisms/PublicBuildGallery", () => ({
  PublicBuildGallery: () => <section>Public build gallery</section>,
}));

describe("HomePage", () => {
  it("shows the hero and public builds without development-only panels", () => {
    render(<HomePage />);

    expect(screen.getByText("Home hero")).toBeInTheDocument();
    expect(screen.getByText("Fan project disclaimer")).toBeInTheDocument();
    expect(screen.getByText("Public build gallery")).toBeInTheDocument();
    expect(screen.queryByText("Backend health")).not.toBeInTheDocument();
  });
});
