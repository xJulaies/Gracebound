import { Show, SignInButton, UserButton } from "@clerk/react";

export function AuthControls() {
  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <span>Signed in</span>
        <UserButton />
      </Show>
    </div>
  );
}
