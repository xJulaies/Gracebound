import { useAuth, useUser } from "@clerk/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyBuildsPage } from "./MyBuildsPage";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
  SignInButton: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a className={className} href={to}>{children}</a>
  ),
}));
vi.mock("../components/organisms/BuildRecordsCollection", () => ({
  BuildRecordsCollection: () => <div>Owned build records</div>,
}));

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({ user: null } as unknown as ReturnType<typeof useUser>);
});

describe("MyBuildsPage", () => {
  it("offers authentication without exposing owned records", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<MyBuildsPage />);

    expect(screen.getByRole("heading", { name: "Tarnished Records" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in to the archive" })).toBeInTheDocument();
    expect(screen.queryByText("Owned build records")).not.toBeInTheDocument();
  });

  it("shows the personal archive and build creation action when signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
    vi.mocked(useUser).mockReturnValue({ user: { firstName: "Melina" } } as unknown as ReturnType<typeof useUser>);
    render(<MyBuildsPage />);

    expect(screen.getByText("Melina’s archive")).toBeInTheDocument();
    expect(screen.getByText("Owned build records")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forge a new build" })).toHaveAttribute("href", "/builds/new");
  });
});
