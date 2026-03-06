'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function BracketPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [tournament, setTournament] = useState<{ teams: any[]; games: any[] } | null>(null)
    const [picks, setPicks] = useState<Record<string, string>>({}) // gameId -> teamId
    const [poolId, setPoolId] = useState('DEFAULT_POOL') // For simplicity, all users in a default pool right now
    const [bracketName, setBracketName] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        fetch('/api/tournament')
            .then(r => r.json())
            .then(data => setTournament(data))
    }, [])

    const handlePick = (gameId: string, teamId: string) => {
        setPicks(prev => ({ ...prev, [gameId]: teamId }))
    }

    const handleSave = async () => {
        setSaving(true)
        const picksArray = Object.keys(picks).map(gameId => ({
            gameId,
            pickedTeamId: picks[gameId]
        }))

        const res = await fetch('/api/bracket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: bracketName || 'My Bracket',
                poolId,
                picks: picksArray
            })
        })

        if (res.ok) {
            alert('Bracket saved successfully!')
        } else {
            alert('Failed to save bracket')
        }
        setSaving(false)
    }

    if (!tournament) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Tournament Data...</div>

    // A full 68-team CSS Grid Bracket layout is quite extensive,
    // We will build a simplified vertical list representation for demonstration
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem' }} className="text-glow">Make Your Picks</h1>
                <div>
                    <input
                        type="text"
                        placeholder="Bracket Name"
                        value={bracketName}
                        onChange={(e) => setBracketName(e.target.value)}
                        className="form-input"
                        style={{ marginRight: '1rem' }}
                    />
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary box-glow">
                        {saving ? 'Saving...' : 'Save Bracket'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {tournament.games.map((game: any) => (
                    <div key={game.id} className="glass" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Round {game.round} - {game.region}
                        </div>

                        <div
                            style={{
                                padding: '0.75rem',
                                border: picks[game.id] === game.team1Id ? '1px solid var(--accent-primary)' : '1px solid var(--card-border)',
                                background: picks[game.id] === game.team1Id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                marginBottom: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                            onClick={() => game.team1Id && handlePick(game.id, game.team1Id)}
                        >
                            <span>{game.team1?.name || 'TBD'}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{game.team1?.seed}</span>
                        </div>

                        <div
                            style={{
                                padding: '0.75rem',
                                border: picks[game.id] === game.team2Id ? '1px solid var(--accent-primary)' : '1px solid var(--card-border)',
                                background: picks[game.id] === game.team2Id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                            onClick={() => game.team2Id && handlePick(game.id, game.team2Id)}
                        >
                            <span>{game.team2?.name || 'TBD'}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{game.team2?.seed}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
