export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background-color)] p-4">
      <div className="text-center">
        <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] mb-4">WELCOME TO MOLDIFY</h1>
        <p className="text-[var(--moldify-grey)] mb-6 font-[family-name:var(--font-bricolage-grotesque)]">This is the main landing page. Please log in to continue.</p>
        <a
          href="/auth/log-in"
          className="inline-block px-6 py-3 bg-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--background-color)] rounded-lg font-semibold shadow hover:bg-[var(--primary-color)]/80 transition"
        >
          Log In
        </a>
      </div>
    </main>
  );
}
