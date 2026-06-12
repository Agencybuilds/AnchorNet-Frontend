import Link from "next/link";
import { ConnectButton } from "./ConnectButton";

/** Top navigation shared across pages. */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-white">
          AnchorNet
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-100">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-100">
            Dashboard
          </Link>
          <Link href="/anchors" className="hover:text-zinc-100">
            Anchors
          </Link>
          <Link href="/settlements" className="hover:text-zinc-100">
            Settlements
          </Link>
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
}
