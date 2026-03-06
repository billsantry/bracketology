'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BracketPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [tournament, setTournament] = useState<{ teams: any[]; games: any[] } | null>(null)
    const [picks, setPicks] = useState<Record<string, string>>({}) // gameId -> teamId
    const [pools, setPools] = useState<any[]>([])
    const [poolId, setPoolId] = useState(searchParams.get('poolId') || '')
    const [bracketName, setBracketName] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')

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

    useEffect(() => {
        fetch('/api/pools')
            .then(r => r.json())
            .then(data => setPools(data.pools || []))
    }, [])

    // Load existing bracket if poolId is set
    useEffect(() => {
        if (!poolId) return
        fetch(`/api/bracket?poolId=${poolId}`)
            .then(r => r.json())
            .then(data => {
                if (data.bracket) {
                    setBracketName(data.bracket.name)
                    const existingPicks: Record<string, string> = {}
                    data.bracket.picks.forEach((p: any) => {
                        existingPicks[p.gameId] = p.pickedTeamId
                    })
                    setPicks(existingPicks)
                }
            })
    }, [poolId])

    const handlePick = (gameId: string, teamId: string) => {
        setPicks(prev => ({ ...prev, [gameId]: teamId }))
    }

    const handleSave = async () => {
        if (!poolId) {
            setSaveMessage('Please select a pool first.')
            return
        }
        setSaving(true)
        setSaveMessage('')
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
            setSaveMessage('✅ Bracket saved successfully!')
        } else {
            const err = await res.json()
            setSaveMessage(`❌ Failed to save: ${err.error || 'Unknown error'}`)
        }
        setSaving(false)
    }

    if (!tournament) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Tournament Data...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem' }} className="text-glow">Make Your Picks</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        value={poolId}
                        onChange={e => setPoolId(e.target.value)}
                        className="form-input"
                        style={{ minWidth: '160px' }}
                    >
                        <option value="">— Select a Pool —</option>
                        {pools.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Bracket Name"
                        value={bracketName}
                        onChange={(e) => setBracketName(e.target.value)}
                        className="form-input"
                    />
                    <button onClick={handleSave} disabled={saving || !poolId} className="btn btn-primary box-glow">
                        {saving ? 'Saving...' : 'Save Bracket'}
                    </button>
                </div>
            </div>

            {saveMessage && (
                <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid var(--card-border)' }}>
                    {saveMessage}
                </div>
            )}

            {!poolId && (
                <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                    ⚠️ Select a pool above to save your picks.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {tournament.games.map((game: any) => (
                    <div key={game.id} className="glass" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Round {game.round} — {game.region}
                        </div>

                        {[{ team: game.team1, id: game.team1Id }, { team: game.team2, id: game.team2Id }].map(({ team, id }) => (
                            <div
                                key={id || 'tbd'}
                                style={{
                                    padding: '0.75rem',
                                    border: picks[game.id] === id ? '1px solid var(--accent-primary)' : '1px solid var(--card-border)',
                                    background: picks[game.id] === id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    cursor: id ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: id ? 1 : 0.4,
                                }}
                                onClick={() => id && handlePick(game.id, id)}
                            >
                                <span>{team?.name || 'TBD'}</span>
                                {team?.seed && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{team.seed}</span>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
