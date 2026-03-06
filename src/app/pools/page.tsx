'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PoolsPage() {
    const { data: session } = useSession()
    const [pools, setPools] = useState([])
    const [newPoolName, setNewPoolName] = useState('')

    useEffect(() => {
        fetch('/api/pools')
            .then(res => res.json())
            .then(data => setPools(data.pools || []))
    }, [])

    const handleCreatePool = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPoolName) return
        const res = await fetch('/api/pools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newPoolName })
        })
        if (res.ok) {
            setNewPoolName('')
            const pool = await res.json()
            setPools([pool, ...pools] as any)
        }
    }

    return (
        <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }} className="text-glow">Tournament Pools</h1>

            {session && (
                <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', maxWidth: '500px' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Create a New Pool</h2>
                    <form onSubmit={handleCreatePool} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Pool Name"
                            value={newPoolName}
                            onChange={e => setNewPoolName(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary box-glow">Create</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {pools.map((pool: any) => (
                    <Link href={`/pools/${pool.id}`} key={pool.id} style={{ textDecoration: 'none' }}>
                        <div className="glass box-glow" style={{ padding: '1.5rem', height: '100%' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{pool.name}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Creator: {pool.creator?.name || 'Unknown'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    {pool._count?.brackets || 0} Brackets
                                </span>
                                <span style={{ color: 'var(--accent-primary)' }}>View Leaderboard →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
