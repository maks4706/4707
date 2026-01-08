import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-semibold">VideoHub</Link>
          <nav className="flex items-center gap-4 text-sm text-gray-300">
            <Link href="/upload" className="hover:text-white">Upload</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
