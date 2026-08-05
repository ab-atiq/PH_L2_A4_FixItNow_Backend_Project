import "dotenv/config";
import bcrypt from "bcryptjs";
import config from "./config";
import { prisma } from "./lib/prisma";
import { Role } from "../generated/prisma/enums";

async function main() {
  console.log("Seeding database...");

  // await prisma.$transaction(async (tx) => {
  //   await tx.payment.deleteMany();
  //   await tx.review.deleteMany();
  //   await tx.booking.deleteMany();
  //   await tx.service.deleteMany();
  //   await tx.technicianProfile.deleteMany();
  //   await tx.category.deleteMany();
  //   await tx.user.deleteMany();
  // });

  // console.log("Database cleared.");

  const hashedPassword = await bcrypt.hash(
    "adminpassword123",
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const admin = await prisma.user.create({
    data: {
      name: "FixItNow Admin",
      email: "fixitnow_admin@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  const categories = await prisma.category.createMany({
    data: [
      {
        name: "Plumbing",
        description: "Pipe repairs, leak fixes, and installations",
      },
      {
        name: "Electrical",
        description: "Wiring, fixtures, and electrical repairs",
      },
      { name: "Cleaning", description: "Home and office cleaning services" },
      {
        name: "Carpentry",
        description: "Furniture making, repairs, and woodwork",
      },
      {
        name: "Painting",
        description: "Interior and exterior painting services",
      },
      {
        name: "Appliance Repair",
        description:
          "Fixing household appliances like refrigerators, washers, etc.",
      },
      {
        name: "HVAC",
        description: "Heating, ventilation, and air conditioning services",
      },
      {
        name: "Landscaping",
        description: "Garden design, lawn care, and outdoor maintenance",
      },
      {
        name: "Pest Control",
        description: "Extermination and prevention of pests and insects",
      },
      {
        name: "Roofing",
        description: "Roof repairs, replacements, and maintenance",
      },
      {
        name: "Flooring",
        description: "Installation and repair of various flooring types",
      },
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
