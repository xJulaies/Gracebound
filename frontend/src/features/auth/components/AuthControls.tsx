import { Show, SignInButton, UserButton } from "@clerk/react";
import { Link } from "@tanstack/react-router";

export function AuthControls() {
  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link className="auth-records-link" to="/my-builds">Tarnished Records</Link>
        <UserButton />
      </Show>
    </div>
  );
}
