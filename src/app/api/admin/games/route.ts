import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized or not an admin' }, { status: 403 })
        }

        const { gameId, winnerId } = await req.json()
        if (!gameId || !winnerId) {
            return NextResponse.json({ error: 'Missing gameId or winnerId' }, { status: 400 })
        }

        // Update game winner
        const game = await prisma.game.update({
            where: { id: gameId },
            data: { winnerId }
        })

        // Advance winner to the next game if nextGameId exists
        if (game.nextGameId) {
            const nextGame = await prisma.game.findUnique({ where: { id: game.nextGameId } })
            if (nextGame) {
                // Find if this team is coming from the team1 slot or team2 slot of the next game
                // For simplicity we just populate the first available empty slot
                if (!nextGame.team1Id) {
                    await prisma.game.update({
                        where: { id: nextGame.id },
                        data: { team1Id: winnerId }
                    })
                } else if (!nextGame.team2Id) {
                    await prisma.game.update({
                        where: { id: nextGame.id },
                        data: { team2Id: winnerId }
                    })
                } else {
                    // Both slots filled? Overwrite team1 slot as fallback
                    await prisma.game.update({
                        where: { id: nextGame.id },
                        data: { team1Id: winnerId }
                    })
                }
            }
        }

        // Recalculate bracket scores
        // Find all Brackets that had a pick for this game
        const bracketsToUpdate = await prisma.bracket.findMany({
            where: {
                picks: {
                    some: { gameId }
                }
            },
            include: { picks: true }
        })

        // Note: a more robust system would calculate the entire bracket score from scratch
        // by comparing all picks against all completed games.
        const allCompletedGames = await prisma.game.findMany({
            where: { winnerId: { not: null } }
        })

        // Round scoring multipliers (0=FirstFour(1pt), 1=Round64(10pts), 2=Round32(20pts), 3=Sweet16(40pts), 4=Elite8(80pts), 5=Final4(160pts), 6=Championship(320pts))
        const getRoundPoints = (roundNum: number) => {
            if (roundNum === 0) return 1
            return 10 * Math.pow(2, roundNum - 1)
        }

        for (const b of bracketsToUpdate) {
            let totalScore = 0
            for (const pick of b.picks) {
                const matchingGame = allCompletedGames.find(g => g.id === pick.gameId)
                if (matchingGame && matchingGame.winnerId === pick.pickedTeamId) {
                    totalScore += getRoundPoints(matchingGame.round)
                }
            }

            await prisma.bracket.update({
                where: { id: b.id },
                data: { score: totalScore }
            })
        }

        return NextResponse.json({ success: true, game })
    } catch (error) {
        console.error('Admin game update error:', error)
        return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
    }
}
