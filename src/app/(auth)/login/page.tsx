import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — Sproutly",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-emerald-700 dark:text-emerald-400">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back to Sproutly.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
