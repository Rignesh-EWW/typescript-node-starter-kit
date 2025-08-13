import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  findOrCreateRole,
  findOrCreatePermission,
  givePermissionToRole,
  assignRole,
  prisma,
} from "../src/services/rbac.service";

const argv = yargs(hideBin(process.argv))
  .command(
    "rbac:create-role <name> [guard]",
    "Create a role",
    (y) =>
      y
        .positional("name", { type: "string" })
        .positional("guard", { type: "string", default: "web" }),
    async (args) => {
      await findOrCreateRole(args.name as string, args.guard as string);
      console.log(`✅ Role ready: ${args.name}`);
      await prisma.$disconnect();
    }
  )
  .command(
    "rbac:create-permission <name> [guard]",
    "Create a permission",
    (y) =>
      y
        .positional("name", { type: "string" })
        .positional("guard", { type: "string", default: "web" }),
    async (args) => {
      await findOrCreatePermission(args.name as string, args.guard as string);
      console.log(`✅ Permission ready: ${args.name}`);
      await prisma.$disconnect();
    }
  )
  .command(
    "rbac:give-permission-to-role <role> <permission> [guard]",
    "Link permission to role",
    (y) =>
      y
        .positional("role", { type: "string" })
        .positional("permission", { type: "string" })
        .positional("guard", { type: "string", default: "web" }),
    async (args) => {
      await givePermissionToRole(
        args.role as string,
        args.permission as string,
        args.guard as string
      );
      console.log(
        `✅ Linked permission '${args.permission}' to role '${args.role}'`
      );
      await prisma.$disconnect();
    }
  )
  .command(
    "rbac:assign-role <userId> <role> [guard]",
    "Assign role to a user",
    (y) =>
      y
        .positional("userId", { type: "number" })
        .positional("role", { type: "string" })
        .positional("guard", { type: "string", default: "web" }),
    async (args) => {
      const userId = args.userId as number;
      await assignRole(
        "App\\Models\\User",
        userId,
        args.role as string,
        args.guard as string
      );
      console.log(`✅ Assigned role '${args.role}' to user ${userId}`);
      await prisma.$disconnect();
    }
  )
  .demandCommand(1)
  .strict()
  .help().argv;

export default argv;
