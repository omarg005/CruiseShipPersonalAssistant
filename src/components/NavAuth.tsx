"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavAuth() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (session?.user) {
    return (
      <button
        className="nautical-link"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Logout
      </button>
    );
  }
  return <Link href="/login" className="nautical-link">Login</Link>;
}

