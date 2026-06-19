import Link from "next/link";

export default function AuthCodeError() {
  return (
    <main className="aurora flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <h1 className="text-2xl font-bold">Sign-in didn’t complete</h1>
        <p className="mt-3 text-white/60">
          Something went wrong finishing that sign-in. Please try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
