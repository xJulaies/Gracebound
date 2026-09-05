import { useAuth } from "@clerk/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { CreateBuildPage } from "./CreateBuildPage";

vi.mock("@clerk/react", () => ({
  SignInButton: ({ children }: { children: ReactNode }) => children,
  useAuth: vi.fn(),
}));

vi.mock(
  "../components/organisms/BuildEditorWorkspace",
  () => ({
    BuildEditorWorkspace: () => <div>Build editor workspace</div>,
  }),
);

describe("CreateBuildPage", () => {
  it("asks anonymous visitors to sign in", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    } as ReturnType<typeof useAuth>);

    render(<CreateBuildPage />);

    expect(
      screen.getByRole("heading", { name: "Sign in to create a build" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Build editor workspace")).not.toBeInTheDocument();
  });

  it("shows the build editor workspace to authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as ReturnType<typeof useAuth>);

    render(<CreateBuildPage />);

    expect(screen.getByText("Build editor workspace")).toBeInTheDocument();
  });
});
