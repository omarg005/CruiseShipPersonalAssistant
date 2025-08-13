"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="you@example.com"
        />
        <button
          onClick={() => signIn("credentials", { email, callbackUrl: "/" })}
          className="w-full btn"
        >
          Sign in
        </button>
        <div className="text-sm text-gray-500">
          Demo: alice@example.com, bob@example.com, carla@example.com, crew@example.com, admin@example.com
        </div>
      </div>
    </div>
  );
}

