import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Prisma 7 requires explicitly passing the adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding Database...')

    // Create an initial admin user with a real hashed password
    const hashedPassword = await bcrypt.hash('password123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@brackets.com' },
        update: { passwordHash: hashedPassword },
        create: {
            email: 'admin@brackets.com',
            passwordHash: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
        },
    })

    // Clear existing games to avoid duplicates
    await prisma.pick.deleteMany({})
    await prisma.game.deleteMany({})
    await prisma.team.deleteMany({})

    // ─────────────────────────────────────────────────────────────
    // TEAMS: 4 regions × 16 seeds = 64 standard teams + 4 First Four
    // ─────────────────────────────────────────────────────────────
    const regions = ['East', 'West', 'South', 'Midwest']

    const teamMap: Record<string, string> = {} // "Region-Seed" -> team id

    for (const region of regions) {
        for (let seed = 1; seed <= 16; seed++) {
            const team = await prisma.team.create({
                data: {
                    name: `(${seed}) ${region}`,
                    seed,
                    region,
                },
            })
            teamMap[`${region}-${seed}`] = team.id
        }
    }

    // 4 First Four teams (play-in games)
    const ffTeams = [
        { key: 'FF-E16A', name: 'East 16-A', seed: 16, region: 'East' },
        { key: 'FF-E11A', name: 'East 11-A', seed: 11, region: 'East' },
        { key: 'FF-W16A', name: 'West 16-A', seed: 16, region: 'West' },
        { key: 'FF-S10A', name: 'South 10-A', seed: 10, region: 'South' },
    ]
    for (const t of ffTeams) {
        const team = await prisma.team.create({
            data: { name: t.name, seed: t.seed, region: t.region },
        })
        teamMap[t.key] = team.id
    }

    console.log('Successfully seeded 68 teams')

    // ─────────────────────────────────────────────────────────────
    // GAMES: Build the full bracket tree bottom-up.
    //
    // Structure per region (15 games):
    //   Round 1 (R64): 8 games  → seeds 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    //   Round 2 (R32): 4 games
    //   Sweet 16:      2 games
    //   Elite 8:       1 game
    // Final Four:      2 games (across regions)
    // Championship:    1 game
    // First Four:      4 games (round 0)
    //
    // Total: 4×15 + 2 + 1 + 4 = 67 games
    // ─────────────────────────────────────────────────────────────

    // Helper: create an empty game placeholder
    async function createGame(round: number, region: string, t1?: string, t2?: string) {
        return prisma.game.create({
            data: { round, region, team1Id: t1 ?? null, team2Id: t2 ?? null },
        })
    }

    // Helper: set nextGameId on a game
    async function linkNext(gameId: string, nextId: string) {
        return prisma.game.update({ where: { id: gameId }, data: { nextGameId: nextId } })
    }

    // ── Championship (round 6) ──
    const championship = await createGame(6, 'Final')

    // ── Final Four (round 5): two semi-finals ──
    const ff1 = await createGame(5, 'Final') // East vs West winner
    const ff2 = await createGame(5, 'Final') // South vs Midwest winner
    await linkNext(ff1.id, championship.id)
    await linkNext(ff2.id, championship.id)

    // Per-region matchup seedings for round 1 (1-indexed seed pairs)
    const r1Matchups: [number, number][] = [
        [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15],
    ]

    // Map region to its Final Four game
    const regionToFF: Record<string, typeof ff1> = {
        East: ff1, West: ff1, South: ff2, Midwest: ff2,
    }

    for (const region of regions) {
        // Elite 8 (round 4) — feeds into Final Four
        const elite8 = await createGame(4, region)
        await linkNext(elite8.id, regionToFF[region].id)

        // Sweet 16 (round 3) — 2 games feed into Elite 8
        const s16a = await createGame(3, region)
        const s16b = await createGame(3, region)
        await linkNext(s16a.id, elite8.id)
        await linkNext(s16b.id, elite8.id)

        // Round 2 / R32 (round 2) — 4 games feed into 2 Sweet 16 slots
        const r32 = [
            await createGame(2, region),
            await createGame(2, region),
            await createGame(2, region),
            await createGame(2, region),
        ]
        await linkNext(r32[0].id, s16a.id)
        await linkNext(r32[1].id, s16a.id)
        await linkNext(r32[2].id, s16b.id)
        await linkNext(r32[3].id, s16b.id)

        // Round 1 / R64 (round 1) — 8 games feed into 4 R32 slots
        for (let i = 0; i < 8; i++) {
            const [s1, s2] = r1Matchups[i]
            const t1 = teamMap[`${region}-${s1}`]
            const t2 = teamMap[`${region}-${s2}`]
            const g = await createGame(1, region, t1, t2)
            await linkNext(g.id, r32[Math.floor(i / 2)].id)
        }
    }

    // ── First Four (round 0) — 4 play-in games ──
    // These teams replace the seeded teams they'd normally face in R64.
    // For simplicity, they're just created as standalone round-0 games.
    await createGame(0, 'East', teamMap['East-16'], teamMap['FF-E16A'])
    await createGame(0, 'East', teamMap['East-11'], teamMap['FF-E11A'])
    await createGame(0, 'West', teamMap['West-16'], teamMap['FF-W16A'])
    await createGame(0, 'South', teamMap['South-10'], teamMap['FF-S10A'])

    console.log('Successfully seeded all 67 games')
    console.log('Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
