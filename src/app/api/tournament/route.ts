import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch all 68 teams along with region and seed
        const teams = await prisma.team.findMany({
            orderBy: [
                { region: 'asc' },
                { seed: 'asc' }
            ]
        })

        // Fetch all games
        const games = await prisma.game.findMany({
            orderBy: { round: 'asc' },
            include: {
                team1: true,
                team2: true,
                winner: true
            }
        })

        return NextResponse.json({ teams, games })
    } catch (error) {
        console.error('Tournament API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 })
    }
}
