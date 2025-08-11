import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("12345678", 10);

  // Admins
  await prisma.admin.createMany({
    data: [
      {
        name: "Admin One",
        email: "admin1@example.com",
        password: hashedPassword,
      },
      {
        name: "Admin Two",
        email: "admin2@example.com",
        password: hashedPassword,
      },
    ],
  });

  // Users
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@mail.com`,
        phone: `12345678${i}`,
        password: hashedPassword,
        status: i % 2 === 0, // alternate status
      },
    });
  }

  // App Settings
  await prisma.appSetting.createMany({
    data: [
      {
        app_label: "iOS App",
        app_type: "ios",
        app_version: 1,
        force_updates: false,
        maintenance_mode: false,
      },
      {
        app_label: "Android App",
        app_type: "android",
        app_version: 1,
        force_updates: false,
        maintenance_mode: false,
      },
    ],
  });

  // App Variables
  await prisma.appVariable.createMany({
    data: [
      { name: "maintenance_banner", value: "We’ll be back soon!" },
      { name: "enable_dark_mode", value: "true" },
    ],
  });

  // App Menu Links
  await prisma.appMenuLink.createMany({
    data: [
      {
        name: "about_us",
        show_name: "About Us",
        for: "user",
        type: "ckeditor",
        value: "About our app...",
      },
      {
        name: "terms_and_conditions",
        show_name: "Terms & Conditions",
        for: "user",
        type: "ckeditor",
        value: "Terms...",
      },
      {
        name: "privacy_policy",
        show_name: "Privacy Policy",
        for: "user",
        type: "ckeditor",
        value: "Privacy...",
      },
    ],
  });

  // Notifications
  const users = await prisma.user.findMany();
  for (const user of users.slice(0, 3)) {
    await prisma.notification.createMany({
      data: [
        {
          user_id: user.id,
          title: "Welcome",
          message: "Thanks for joining!",
          read: false,
        },
        {
          user_id: user.id,
          title: "Reminder",
          message: "Check your profile",
          read: false,
        },
      ],
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
