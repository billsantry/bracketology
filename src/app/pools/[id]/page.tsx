'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function PoolLeaderboard() {
    const { id } = useParams()
    const [pool, setPool] = useState<any>(null)

    useEffect(() => {
        if (id) {
            fetch(`/api/leaderboard?poolId=${id}`)
                .then(res => res.json())
                .then(data => setPool(data))
        }
    }, [id])

    if (!pool) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Leaderboard...</div>
    if (pool.error) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--accent-error)' }}>{pool.error}</div>

    return (
        <div>
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} className="text-glow">{pool.name}</h1>
                <p style={{ color: '#94a3b8' }}>Created by {pool.creator?.name}</p>
            </div>

            <div className="glass" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(15, 23, 42, 0.4)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#94a3b8' }}>Rank</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#94a3b8' }}>Player</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#94a3b8' }}>Bracket Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#94a3b8', textAlign: 'right' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!pool.brackets || pool.brackets.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No brackets entered yet</td>
                            </tr>
                        ) : (
                            pool.brackets.map((bracket: any, index: number) => (
                                <tr key={bracket.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '50%', background: index < 3 ? 'var(--accent-primary)' : 'transparent',
                                            color: index < 3 ? 'white' : 'inherit', fontWeight: index < 3 ? 'bold' : 'normal'
                                        }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{bracket.user?.name || 'Unknown'}</td>
                                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{bracket.name}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                        {bracket.score} pts
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
