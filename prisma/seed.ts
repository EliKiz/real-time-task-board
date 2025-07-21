import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: await bcrypt.hash("password", 12),
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("password", 12),
      role: UserRole.ADMIN,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {
      password: await bcrypt.hash("password", 12),
    },
    create: {
      email: "employee@example.com",
      name: "John Employee",
      password: await bcrypt.hash("password", 12),
      role: UserRole.EMPLOYEE,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
