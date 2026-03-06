import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma 7 requires explicitly passing the adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding Database...')

    // Create an initial admin user
    await prisma.user.upsert({
        where: { email: 'admin@brackets.com' },
        update: {},
        create: {
            email: 'admin@brackets.com',
            passwordHash: 'hashed_password_here', // We will replace with real auth later
            name: 'Admin',
            role: 'ADMIN',
        },
    })

    // Regions
    const regions = ['East', 'West', 'South', 'Midwest']

    // First string is the region name, then array of 16 teams. 
    // We'll create standard 64 teams, plus 4 first-four teams

    for (const region of regions) {
        for (let seed = 1; seed <= 16; seed++) {
            await prisma.team.upsert({
                where: { name: `${region} Seed ${seed}` },
                update: {},
                create: {
                    name: `${region} Seed ${seed}`,
                    seed: seed,
                    region: region,
                },
            })
        }
    }

    // Create 4 'First Four' specific teams that will play into the 16 or 11 seeds
    const firstFour = [
        { name: 'East First Four A', seed: 16, region: 'East' },
        { name: 'East First Four B', seed: 11, region: 'East' },
        { name: 'West First Four A', seed: 16, region: 'West' },
        { name: 'South First Four A', seed: 10, region: 'South' }
    ]

    for (const t of firstFour) {
        await prisma.team.upsert({
            where: { name: t.name },
            update: {},
            create: t,
        })
    }

    console.log('Successfully seeded 68 teams')

    // (In a complete implementation, we'd also generate the 67 empty Game records here 
    //  with correct nextGameId relationships for the bracket tree)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
