const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const seedRoles = require("./seeds/roles");
const seedUsers = require("./seeds/users");

async function main() {
  const { userRole, adminRole } = await seedRoles();
  await seedUsers(userRole, adminRole);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
