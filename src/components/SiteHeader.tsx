import Link from "next/link";

/** Top navigation shared across pages. */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-white">
          AnchorNet
        </Link>
        <div className="flex gap-4 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-100">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-100">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
