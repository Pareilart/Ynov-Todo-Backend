import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import seedRoles from "./seeds/roles.js";
import seedUsers from "./seeds/users.js";

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
