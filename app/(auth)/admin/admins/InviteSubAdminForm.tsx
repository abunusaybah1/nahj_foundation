"use client";

import { useActionState, useEffect, useState } from "react";
import { inviteSubAdmin, type InviteState } from "../actions";

const initialState: InviteState = {};

export default function InviteSubAdminForm() {
  const [state, formAction, pending] = useActionState(
    inviteSubAdmin,
    initialState,
  );

  const [message, setMessage] = useState("");
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    setMessage(
      state?.error ? state.error : state?.success ? "Invite sent" : "",
    );
  }

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <>
      <form
        action={formAction}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          name="full_name"
          placeholder="Full name"
          required
          className="flex-1 border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-crimson"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="flex-1 border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-crimson"
        />
        <button
          disabled={pending}
          className="bg-crimson px-5 py-2.5 text-sm font-semibold text-paper hover:bg-crimson-darker disabled:opacity-60"
        >
          {pending ? "Inviting…" : "Invite"}
        </button>
      </form>
      <div className="mt-2">
        {message && (
          <p className="w-full text-sm text-crimson-darker sm:basis-full">
            {message}
          </p>
        )}
      </div>
    </>
  );
}
