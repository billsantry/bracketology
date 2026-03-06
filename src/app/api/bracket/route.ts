import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const poolId = searchParams.get('poolId')

        if (!poolId) return NextResponse.json({ error: 'poolId is required' }, { status: 400 })

        const bracket = await prisma.bracket.findUnique({
            where: {
                userId_poolId: {
                    userId: (session.user as any).id,
                    poolId
                }
            },
            include: {
                picks: true
            }
        })

        return NextResponse.json({ bracket })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { poolId, name, picks } = await req.json()
        // picks structure: [{ gameId: string, pickedTeamId: string }]

        if (!poolId || !name || !picks) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
        }

        const userId = (session.user as any).id

        // Check if bracket already exists
        const existing = await prisma.bracket.findUnique({
            where: { userId_poolId: { userId, poolId } }
        })

        if (existing) {
            // Update picks
            await prisma.pick.deleteMany({ where: { bracketId: existing.id } })

            const updatedBracket = await prisma.bracket.update({
                where: { id: existing.id },
                data: {
                    picks: {
                        create: picks.map((p: any) => ({
                            gameId: p.gameId,
                            pickedTeamId: p.pickedTeamId
                        }))
                    }
                },
                include: { picks: true }
            })

            return NextResponse.json(updatedBracket)
        } else {
            // Create new bracket
            const newBracket = await prisma.bracket.create({
                data: {
                    userId,
                    poolId,
                    name,
                    picks: {
                        create: picks.map((p: any) => ({
                            gameId: p.gameId,
                            pickedTeamId: p.pickedTeamId
                        }))
                    }
                },
                include: { picks: true }
            })

            return NextResponse.json(newBracket, { status: 201 })
        }

    } catch (error) {
        console.error('Bracket submission error:', error)
        return NextResponse.json({ error: 'Failed to submit bracket' }, { status: 500 })
    }
}
