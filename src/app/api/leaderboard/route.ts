import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const poolId = searchParams.get('poolId')

        if (!poolId) return NextResponse.json({ error: 'poolId is required' }, { status: 400 })

        const pool = await prisma.pool.findUnique({
            where: { id: poolId },
            include: {
                creator: { select: { name: true } },
                brackets: {
                    orderBy: { score: 'desc' },
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        })

        if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

        return NextResponse.json(pool)
    } catch (error) {
        console.error('Leaderboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }
}
