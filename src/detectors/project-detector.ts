import { readFile, readdir } from "fs/promises";
import { join } from "path";

type ProjectType =
  | "express-js"
  | "express-ts"
  | "nestjs"
  | "nextjs-legacy"
  | "nextjs-standalone"
  | "astro-ssg"
  | "astro-ssr";

export interface ProjectConfig {
  type: ProjectType;
  isStatic: boolean;
  defaultPort?: number;
}

const PROJECT_CONFIGS: Record<ProjectType, ProjectConfig> = {
  "express-js": {
    type: "express-js",
    isStatic: false,
    defaultPort: 3000,
  },
  "express-ts": {
    type: "express-ts",
    isStatic: false,
    defaultPort: 3000,
  },
  nestjs: {
    type: "nestjs",
    isStatic: false,
    defaultPort: 3000,
  },
  "nextjs-legacy": {
    type: "nextjs-legacy",
    isStatic: false,
    defaultPort: 3000,
  },
  "nextjs-standalone": {
    type: "nextjs-standalone",
    isStatic: false,
    defaultPort: 3000,
  },
  "astro-ssg": {
    type: "astro-ssg",
    isStatic: true,
  },
  "astro-ssr": {
    type: "astro-ssr",
    isStatic: false,
    defaultPort: 4321,
  },
};

export class ProjectDetector {
  async detect(): Promise<ProjectConfig> {
    try {
      const projectType = await this.detectProjectType();
      return PROJECT_CONFIGS[projectType];
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error("No package.json found in the current directory");
      }
      throw new Error("Unable to detect project type: " + error.message);
    }
  }

  private async detectProjectType(): Promise<ProjectType> {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), "package.json"), "utf-8")
    );

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies["astro"]) {
      // Check for astro.config file using regex pattern
      const files = await readdir(process.cwd());
      const astroConfigRegex = /^astro\.config/;
      const astroConfigFile = files.find((file) => astroConfigRegex.test(file));

      if (!astroConfigFile) {
        return "astro-ssg"; // Default to SSG if no astro.config file
      }
      const config = await readFile(
        join(process.cwd(), astroConfigFile),
        "utf-8"
      );
      // Check if SSR is enabled by looking for output: 'server' or adapter configuration
      if (
        config.includes("output: 'server'") ||
        config.includes("output:'server'") ||
        config.includes('output: "server"') ||
        config.includes("adapter:")
      ) {
        return "astro-ssr";
      }
      return "astro-ssg"; // Default to SSG if no SSR configuration found
    }

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
  }
}
