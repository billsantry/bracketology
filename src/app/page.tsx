import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '6rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }} className="text-glow">
        The Ultimate <br />
        <span style={{ color: 'var(--accent-primary)' }}>NCAA Bracket</span> Engine
      </h1>

      <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
        Welcome to Bracketology. Join pools, make your predictions, and watch the leaderboard update in real-time as games are played.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Get Started
        </Link>
        <Link href="/pools" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          View Leaderboards
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '6rem', textAlign: 'left' }}>
        <div className="glass box-glow" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏀</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Make Your Picks</h3>
          <p style={{ color: '#94a3b8' }}>Fill out your 68-team bracket with our interactive, responsive bracket builder.</p>
        </div>
        <div className="glass box-glow" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Join Pools</h3>
          <p style={{ color: '#94a3b8' }}>Compete against friends, family, and coworkers in customized leaderboard pools.</p>
        </div>
        <div className="glass box-glow" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Real-time Scoring</h3>
          <p style={{ color: '#94a3b8' }}>Our scoring engine automatically updates everyone's rankings the second a game finishes.</p>
        </div>
      </div>
    </div>
  )
}
