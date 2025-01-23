#!/usr/bin/env node

import { Command } from "commander";
import { ProjectDetector } from "./detectors/project-detector";
import { DockerBuilder } from "./builders/docker-builder";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { run } from "./commands";

async function main() {
  const program = new Command();

  program
    .name("kage")
    .description("CLI tool to automate self-hosting configuration")
    .version("1.0.0");

  program.command("init").action(async () => {
    const spinner = ora("Detecting project type...").start();

    try {
      // Detect project type
      const detector = new ProjectDetector();
      const projectType = await detector.detect();

      spinner.succeed(`Detected ${projectType} project`);

      // Get configuration from user
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "port",
          message: "Which port should the app run on?",
          default: "3000",
          validate: (input) => !isNaN(parseInt(input)),
        },
        {
          type: "input",
          name: "domain",
          message: "What is your domain name?",
          suffix:
            "\n Use 'localhost' subdomain if you're working locally (e.g., obb.localhost, subdomain.localhost).\n Use your main domain for staging and production (e.g., example.com, staging.example.com).\n If assigning to multiple domains or subdomains, separate them with commas (e.g., example1.com, example2.com).\n",
          default: "obb.localhost",
          validate: (input) => {
            // Basic domain validation
            const domainRegex =
              /^(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}(?:,\s(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,})*$/;
            if (!domainRegex.test(input)) {
              return "Please enter a valid domain name (e.g., example.com) or a list of domains separated by commas.";
            }
            return true;
          },
        },
        {
          type: "input",
          name: "email",
          message: "What is your email address? (for SSL certificates)",
          validate: (input) => {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) {
              return "Please enter a valid email address";
            }
            return true;
          },
        },
      ]);

      spinner.start("Generating Docker configurations...");

      const builder = new DockerBuilder({
        appName: "testing",
        projectType,
        port: parseInt(answers.port),
        domain: answers.domain,
        email: answers.email,
      });

      await builder.build();

      spinner.succeed("Successfully generated Docker configurations!");
      console.log(chalk.green("\nFiles created:"));
      console.log("kage/");
      console.log("├── Dockerfile");
      console.log("├── docker-compose.yml");
      console.log("├──.env");
      console.log("└── caddy_config/");
      console.log("    └── Caddyfile");

      console.log(chalk.blueBright("\n Update .env with your secrets..."));
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

  program
    .command("run")
    .description("Start the Docker containers")
    .action(run);

  program.parse();
}

main().catch(console.error);
