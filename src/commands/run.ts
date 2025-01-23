import ora from "ora";
import chalk from "chalk";

export const run = async () => {
  const spinner = ora("Starting Docker containers...\n").start();

  try {
    const { execSync } = require("child_process");
    const { access } = require("fs/promises");

    const composePath = "./kage/docker-compose.yml";

    try {
      await access(composePath);
    } catch {
      throw new Error(
        "Docker Compose file not found. Please run 'kage init' first."
      );
    }

    execSync(`docker-compose -f ${composePath} up -d`, {
      stdio: "inherit",
    });

    spinner.succeed("Docker containers started successfully!");
  } catch (error: any) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
};
