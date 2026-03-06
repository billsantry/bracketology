'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [tournament, setTournament] = useState<any>(null)

    useEffect(() => {
        if (status === 'unauthenticated' || (session?.user && (session.user as any).role !== 'ADMIN')) {
            router.push('/')
        }
    }, [status, session, router])

    useEffect(() => {
        fetch('/api/tournament')
            .then(res => res.json())
            .then(data => setTournament(data))
    }, [])

    const handleSetWinner = async (gameId: string, winnerId: string) => {
        if (!confirm('Commit this game result and recalculate all brackets?')) return

        const res = await fetch('/api/admin/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, winnerId })
        })

        if (res.ok) {
            alert('Game result committed and brackets scored!')
            // Refresh
            const updated = await fetch('/api/tournament').then(r => r.json())
            setTournament(updated)
        } else {
            alert('Failed to update game result')
        }
    }

    if (status === 'loading' || !tournament) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Admin Panel...</div>

    return (
        <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-secondary)' }} className="text-glow">Admin Dashboard</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Enter live game results here to automatically progress the bracket and calculate user scores.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {tournament.games.map((game: any) => (
                    <div key={game.id} className="glass" style={{ padding: '1.5rem', borderLeft: game.winnerId ? '4px solid var(--accent-success)' : '4px solid var(--accent-secondary)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#94a3b8' }}>Round {game.round} - {game.region}</h3>

                        {/* Team 1 Button */}
                        <div style={{ marginBottom: '0.5rem' }}>
                            <button
                                onClick={() => handleSetWinner(game.id, game.team1Id)}
                                disabled={!!game.winnerId || !game.team1Id || !game.team2Id}
                                className={game.winnerId === game.team1Id ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{
                                    width: '100%', justifyContent: 'space-between', padding: '0.75rem',
                                    borderColor: game.winnerId === game.team1Id ? 'var(--accent-primary)' : 'var(--card-border)'
                                }}
                            >
                                <span>{game.team1?.name || '(Empty Slot)'}</span>
                                <span style={{ opacity: 0.7 }}>{game.team1?.seed || '-'}</span>
                            </button>
                        </div>

                        {/* Team 2 Button */}
                        <div>
                            <button
                                onClick={() => handleSetWinner(game.id, game.team2Id)}
                                disabled={!!game.winnerId || !game.team1Id || !game.team2Id}
                                className={game.winnerId === game.team2Id ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{
                                    width: '100%', justifyContent: 'space-between', padding: '0.75rem',
                                    borderColor: game.winnerId === game.team2Id ? 'var(--accent-primary)' : 'var(--card-border)'
                                }}
                            >
                                <span>{game.team2?.name || '(Empty Slot)'}</span>
                                <span style={{ opacity: 0.7 }}>{game.team2?.seed || '-'}</span>
                            </button>
                        </div>
                        {game.winnerId && (
                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--accent-success)', textAlign: 'center' }}>
                                Winner Recorded & Scored
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
