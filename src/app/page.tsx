import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAppSession();
  if (session) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-20">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
          Sproutly
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Grow your product with clarity.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Plan in Plots, track work as Sprouts, and ship with Harvests—aligned with
          your real process, not a rigid template.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-12 text-sm text-zinc-500">
          Product spec:{" "}
          <Link
            href="https://github.com/cogniversity/sproutly/blob/main/docs/BUSINESS_REQUIREMENTS_DOCUMENT.md"
            className="text-emerald-700 underline dark:text-emerald-400"
          >
            Business requirements
          </Link>
          {" · "}
          <Link
            href="https://github.com/cogniversity/sproutly/blob/main/docs/EXECUTION_PLAN.md"
            className="text-emerald-700 underline dark:text-emerald-400"
          >
            Execution plan
          </Link>
        </p>
      </div>
    </div>
  );
}
