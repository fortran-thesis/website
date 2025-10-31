export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Moldify</h1>
        <p className="text-gray-600 mb-6">This is the main landing page. Please log in to continue.</p>
        <a
          href="/auth/log-in"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Log In
        </a>
      </div>
    </main>
  );
}
