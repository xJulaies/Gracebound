import { useAuth } from "@clerk/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BuildCreationCallout } from "./BuildCreationCallout";

vi.mock("@clerk/react", () => ({
  SignInButton: ({ children }: { children: ReactNode }) => children,
  useAuth: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("BuildCreationCallout", () => {
  it("offers Clerk sign-in to signed-out visitors", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    } as ReturnType<typeof useAuth>);

    render(<BuildCreationCallout />);

    expect(
      screen.getByRole("button", { name: "Sign in to start building" }),
    ).toBeInTheDocument();
  });

  it("links signed-in users to the character selection", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as ReturnType<typeof useAuth>);

    render(<BuildCreationCallout />);

    expect(screen.getByRole("link", { name: "Start building" })).toHaveAttribute(
      "href",
      "/builds/new",
    );
  });
});
