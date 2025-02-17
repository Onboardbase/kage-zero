#!/usr/bin/env node

import { Command } from "commander";
import { ProjectDetector } from "./detectors/project-detector";
import { DockerBuilder } from "./builders/docker-builder";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import pkg from "../package.json";
import { build, run } from "./commands";

async function main() {
  const program = new Command();

  program.name(pkg.name).description(pkg.description).version(pkg.version);

  program.command("init")
  .option('-n, --app-name <name>', 'Application name (must match "^[a-z0-9][a-z0-9_-]*$")')
  .option('-p, --port <port>', 'Port the app should run on')
  .option('-o, --output-dir <dir>', 'Build output directory')
  .option('-d, --domain <domain>', 'Domain name (e.g., example.com or subdomain.localhost)')
  .option('-e, --email <email>', 'Email address for SSL certificates')
  .action(async (options) => {
    const spinner = ora("Detecting project type...").start();

    try {
      // Detect project type
      const detector = new ProjectDetector();
      const projectConfig = await detector.detect();

      spinner.succeed(`Detected ${projectConfig.type} project`);

      // Prepare answers object with provided options
      const answers: any = {
        appName: options.appName,
        port: options.port,
        outputDir: options.outputDir,
        domain: options.domain,
        email: options.email
      };

      // Only prompt for missing values
      const prompts = [];
      
      if (!answers.appName) {
        prompts.push({
          type: "input",
          name: "appName",
          message: "What is your application name?",
          default: 'kage',
          validate: (input: string) =>
            /^[a-z0-9][a-z0-9_-]*$/.test(input) ||
            "Name must match '^[a-z0-9][a-z0-9_-]*$'",
        });
      }

      if (!projectConfig.isStatic && !answers.port) {
        prompts.push({
          type: "input",
          name: "port",
          message: "Which port should the app run on?",
          default: projectConfig.defaultPort || "3000",
          validate: (input: string) => !isNaN(parseInt(input)),
        });
      }

      if (projectConfig.isStatic && !answers.outputDir) {
        prompts.push({
          type: "input",
          name: "outputDir",
          message: "What is your build output directory?",
          default: projectConfig.outputDir,
          validate: (input: string) => {
            const dirRegex =
              /^([a-zA-Z0-9]+[a-zA-Z0-9\/._-]*[a-zA-Z0-9]+|[a-zA-Z0-9]+|\.{1}[a-zA-Z0-9][a-zA-Z0-9\/._-]*[a-zA-Z0-9]*)$/;
            if (!dirRegex.test(input)) {
              return "Invalid directory path. Must start and end with alphanumeric characters and can only contain letters, numbers, underscores, hyphens, dots, and forward slashes";
            }
            return true;
          },
        });
      }

      if (!answers.domain) {
        prompts.push({
          type: "input",
          name: "domain",
          message: "What is your domain name?",
          suffix:
            "\n Use 'localhost' subdomain if you're working locally (e.g., obb.localhost, subdomain.localhost).\n Use your main domain for staging and production (e.g., example.com, staging.example.com).\n If assigning to multiple domains or subdomains, separate them with commas (e.g., example1.com, example2.com).\n",
          default: "obb.localhost",
          validate: (input: string) => {
            const domainRegex =
              /^(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}(?:,\s(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,})*$/;
            if (!domainRegex.test(input)) {
              return "Please enter a valid domain name (e.g., example.com) or a list of domains separated by commas.";
            }
            return true;
          },
        });
      }

      if (!answers.email) {
        prompts.push({
          type: "input",
          name: "email",
          message: "What is your email address? (for SSL certificates)",
          validate: (input: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) {
              return "Please enter a valid email address";
            }
            return true;
          },
        });
      }

      // Only prompt if there are questions to ask
      if (prompts.length > 0) {
        const promptAnswers = await inquirer.prompt(prompts);
        Object.assign(answers, promptAnswers);
      }

      spinner.start("Generating Docker configurations...");

      const builder = new DockerBuilder({
        appName: answers.appName,
        projectConfig,
        port: parseInt(answers.port),
        domain: answers.domain,
        email: answers.email,
        outputDir: answers.outputDir,
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
      console.log(
        chalk.blueBright(
          "\n To start your application, run the command: 'kage run'.\n Make sure Docker is running and configured properly."
        )
      );
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

  program.command("run").description("Start the Docker containers").action(run);

  program
    .command("build")
    .description("Build the Docker containers")
    .option('-t, --target <target>', 'Build target (local or docker-hub)')
    .option('-a, --account <account>', 'Docker Hub account name')
    .option('-i, --image <image>', 'Docker image name')
    .option('-v, --version <version>', 'Image version')
    .option('-p, --push', 'Push to Docker Hub after build')
    .action(build);

  program.parse();
}

main().catch(console.error);
