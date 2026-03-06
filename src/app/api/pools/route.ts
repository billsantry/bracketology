import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
    try {
        const pools = await prisma.pool.findMany({
            include: {
                _count: {
                    select: { brackets: true }
                },
                creator: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ pools })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await req.json()
        if (!name) return NextResponse.json({ error: 'Pool name is required' }, { status: 400 })

        const newPool = await prisma.pool.create({
            data: {
                name,
                creatorId: (session.user as any).id,
            }
        })

        return NextResponse.json(newPool, { status: 201 })
    } catch (error) {
        console.error('Create pool error:', error)
        return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 })
    }
}
