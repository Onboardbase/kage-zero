import ora from "ora";
import chalk from "chalk";
import { execSync } from "child_process";
import { access } from "fs/promises";
import { checkDockerStatus } from "../utils";

export const build = async () => {
  const spinner = ora("Checking environment...\n").start();

  try {
    if (!(await checkDockerStatus())) {
      spinner.fail(
        chalk.red("Docker is not running. Please start Docker first.")
      );
      process.exit(1);
    }

    // Check for docker-compose file
    const composePath = "./kage/docker-compose.yml";
    try {
      await access(composePath);
    } catch {
      spinner.fail(
        chalk.red(
          "Docker Compose file not found. Please run 'kage init' first."
        )
      );
      process.exit(1);
    }

    spinner.start("Building Docker containers...");
    execSync(`docker-compose -f ${composePath} build`, {
      stdio: "inherit",
    });

    spinner.succeed(chalk.green("Docker containers built successfully!"));
  } catch (error: any) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
};
