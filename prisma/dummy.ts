import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Example: Create a dummy user
    const user = await prisma.user.create({
        data: {
            email: 'dummy@example.com',
            name: 'Dummy User',
        },
    });

    console.log('Created user:', user);

    // Example: Fetch all users
    const users = await prisma.user.findMany();
    console.log('All users:', users);
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });