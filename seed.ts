// src/seed.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import config from "./config";
import { prisma } from "./lib/prisma";
import { Role } from "../generated/prisma/enums";

async function main() {
  console.log("Seeding database...");

  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.service.deleteMany(),
    prisma.technicianProfile.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Database cleared.");

  const hashedPassword = await bcrypt.hash(
    "adminpassword123",
    Number(config.bcrypt_salt_rounds) || 10
  );

  const admin = await prisma.user.create({
    data: {
      name: "FixItNow Admin",
      email: "admin@fixitnow.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  const categories = await prisma.category.createMany({
    data: [
      { name: "Plumbing", description: "Pipe repairs, leak fixes, and installations" },
      { name: "Electrical", description: "Wiring, fixtures, and electrical repairs" },
      { name: "Cleaning", description: "Home and office cleaning services" },
    ],
  });

  console.log(`${categories.count} categories created.`);

  console.log("Seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });