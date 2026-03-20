import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register — Sproutly",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-emerald-700 dark:text-emerald-400">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Start growing your product with Plots and Sprouts.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
