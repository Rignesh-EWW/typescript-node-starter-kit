import { readFileSync } from "fs";
import { join } from "path";

type PackageJson = {
  name: string;
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf-8")
) as PackageJson;

export const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
};
