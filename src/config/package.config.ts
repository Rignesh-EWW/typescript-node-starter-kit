import { readFileSync } from "fs";
import { join } from "path";

type PackageJson = {
  name: string;
  version: string;
};

const packageJsonPath = join(__dirname, "../../package.json");
const packageJson = JSON.parse(
  readFileSync(packageJsonPath, "utf-8")
) as PackageJson;

export const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
};
