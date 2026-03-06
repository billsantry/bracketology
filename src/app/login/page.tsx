'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password
        })

        if (res?.error) {
            setError('Invalid email or password')
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="glass auth-card">
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h1>
            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue</p>

            {error && <div style={{ color: 'var(--accent-error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    Sign In
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
                <Link href="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    Register here
                </Link>
            </div>
        </div>
    )
}
