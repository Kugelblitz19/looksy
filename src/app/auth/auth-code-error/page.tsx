import Link from "next/link";

export default function AuthCodeError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-center text-ink">
      <div className="max-w-sm">
        <p className="kicker text-ink-30">Looksy</p>
        <h1 className="mt-3 font-display text-3xl text-ink">
          Sign-in didn&rsquo;t complete
        </h1>
        <p className="mt-3 text-ink-60">
          Something went wrong finishing that sign-in. Please try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-sm bg-vermilion px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-paper hover:bg-vermilion-ink"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
