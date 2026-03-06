'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
    const { data: session, status } = useSession()

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-brand text-glow">
                <span style={{ color: 'var(--accent-primary)' }}>M</span> Bracketology
            </Link>

            <div className="navbar-links">
                {status === 'loading' ? (
                    <div>...</div>
                ) : session ? (
                    <>
                        <Link href="/bracket" className="nav-link">My Bracket</Link>
                        <Link href="/pools" className="nav-link">Pools</Link>
                        {session.user && (session.user as any).role === 'ADMIN' && (
                            <Link href="/admin" className="nav-link" style={{ color: 'var(--accent-secondary)' }}>Admin</Link>
                        )}
                        <button onClick={() => signOut()} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="nav-link">Login</Link>
                        <Link href="/register" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
