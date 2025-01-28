import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { access } from "fs/promises";
import {
  checkDockerStatus,
  checkPort,
  killProcess,
  stopContainer,
} from "../utils";

export const run = async () => {
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

    spinner.text = "Checking for existing HTTP servers...";
    const port80Process = await checkPort(80);
    const port443Process = await checkPort(443);

    if (port80Process || port443Process) {
      spinner.warn(chalk.yellow("Found existing HTTP server(s) running:"));
      if (port80Process) {
        const processInfo = port80Process.isDocker
          ? `Docker container: ${port80Process.containerName}`
          : `Process ID: ${port80Process.pid}`;
        console.log(chalk.yellow(`- Port 80 is in use (${processInfo})`));
      }

      if (port443Process) {
        const processInfo = port443Process.isDocker
          ? `Docker container: ${port443Process.containerName}`
          : `Process ID: ${port443Process.pid}`;
        console.log(chalk.yellow(`- Port 443 is in use (${processInfo})`));
      }

      if (port80Process?.isDocker || port443Process?.isDocker) {
        console.log(
          chalk.yellow("\nWarning: Some ports are used by Docker containers.")
        );
        console.log(
          chalk.yellow("Stopping them might affect other Docker services.")
        );
      }

      const { shouldKill } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldKill",
          message: "Would you like to stop the existing HTTP server(s)?",
          default: true,
        },
      ]);

      if (shouldKill) {
        spinner.start("Stopping existing HTTP servers...");

        if (port80Process) {
          if (port80Process.isDocker && port80Process.containerName) {
            await stopContainer(port80Process.containerName);
          } else {
            await killProcess(80);
          }
        }

        if (port443Process) {
          if (port443Process.isDocker && port443Process.containerName) {
            await stopContainer(port443Process.containerName);
          } else {
            await killProcess(443);
          }
        }

        spinner.succeed("Existing HTTP servers stopped");
      } else {
        spinner.fail(
          chalk.red(
            "Cannot start Caddy server while ports 80/443 are in use. Please manually close any processes listening on these ports.\n "
          )
        );
        process.exit(1);
      }
    }

    spinner.start("Starting Docker containers...");
    execSync(`docker-compose -f ${composePath} up -d`, {
      stdio: "inherit",
    });

    spinner.succeed(chalk.green("Docker containers started successfully!"));
  } catch (error: any) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
};
