import { readFile, readdir } from "fs/promises";
import { join } from "path";

export type ProjectType =
  | "express-js"
  | "express-ts"
  | "nestjs"
  | "nextjs-legacy"
  | "nextjs-standalone";

export class ProjectDetector {
  async detect(): Promise<ProjectType> {
    try {
      const packageJson = JSON.parse(
        await readFile(join(process.cwd(), "package.json"), "utf-8")
      );

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies["@nestjs/core"]) {
        return "nestjs";
      }

      if (dependencies["next"]) {
        // Find Next.js config file using regex pattern
        const files = await readdir(process.cwd());
        const nextConfigRegex = /^next\.config/;
        const nextConfigFile = files.find((file) => nextConfigRegex.test(file));

        if (!nextConfigFile) {
          return "nextjs-legacy"; // Default to legacy if no config file found
        }

        const nextConfig = await readFile(
          join(process.cwd(), nextConfigFile),
          "utf-8"
        );
        // Check for standalone configuration
        if (nextConfig.includes("standalone")) {
          return "nextjs-standalone";
        }
        return "nextjs-legacy";
      }

      if (dependencies["express"]) {
        // Check if TypeScript is present
        if (dependencies["typescript"] || dependencies["ts-node"]) {
          return "express-ts";
        }
        return "express-js";
      }

      throw new Error(
        "Unsupported project type. Only Express and NestJS projects are currently supported."
      );
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("No package.json found in the current directory");
      }
      throw new Error("Unable to detect project type: " + error.message);
    }
  }
}
