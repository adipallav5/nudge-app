import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Postgres...");
  const user = await prisma.user.create({
    data: {
      email: 'postgres_test@example.com',
      password: 'hashedpassword',
    }
  });
  console.log("Created user:", user);

  const foundUser = await prisma.user.findUnique({
    where: { email: 'postgres_test@example.com' }
  });
  console.log("Read user from DB:", foundUser);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.user.deleteMany({ where: { email: 'postgres_test@example.com' } });
    await prisma.$disconnect();
  });
