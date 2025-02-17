import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { access, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { checkDockerStatus } from "../utils";

const COMPOSE_FILE_PATH = "./kage/docker-compose.yml";

interface BuildOptions {
  target?: "local" | "docker-hub";
  account?: string;
  image?: string;
  version?: string;
  push?: boolean;
}

interface DockerHubDetails {
  dockerHubAccount: string;
  imageName: string;
  version: string;
}

async function verifyDockerEnvironment(spinner: ora.Ora) {
  if (!(await checkDockerStatus())) {
    spinner.fail(
      chalk.red("Docker is not running. Please start Docker first.")
    );
    process.exit(1);
  }
}

async function verifyComposeFileExists(spinner: ora.Ora) {
  try {
    await access(COMPOSE_FILE_PATH);
  } catch {
    spinner.fail(
      chalk.red("Docker Compose file not found. Please run 'kage init' first.")
    );
    process.exit(1);
  }
}

async function updateComposeFileWithImageTag(fullImageName: string) {
  try {
    // Read and parse the docker-compose file
    const composeContent = await readFile(COMPOSE_FILE_PATH, "utf8");
    const composeConfig = yaml.load(composeContent) as any;

    // Update image tag for the app service only
    if (composeConfig?.services?.app) {
      composeConfig.services.app.image = fullImageName;
    }

    // Write the updated content back to the file
    const updatedContent = yaml.dump(composeConfig);
    await writeFile(COMPOSE_FILE_PATH, updatedContent);
  } catch (error: any) {
    throw new Error(`Failed to update docker-compose file: ${error.message}`);
  }
}

async function promptForBuildTarget() {
  return inquirer.prompt([
    {
      type: "list",
      name: "buildTarget",
      message: "Where would you like to build?",
      choices: [
        {
          name: "Local",
          value: "local",
        },
        {
          name: "Docker Hub",
          value: "docker-hub",
        },
      ],
    },
  ]);
}

async function promptForDockerHubDetails() {
  return inquirer.prompt([
    {
      type: "input",
      name: "dockerHubAccount",
      message: "Enter your Docker Hub account name:",
      validate: (input) => input.trim() !== "",
    },
    {
      type: "input",
      name: "imageName",
      message: "Enter the image name:",
      validate: (input) => input.trim() !== "",
    },
    {
      type: "input",
      name: "version",
      message: "Enter the version number:",
      default: "latest",
    },
  ]);
}

async function promptForBuildAction() {
  return inquirer.prompt([
    {
      type: "list",
      name: "buildAction",
      message: "What would you like to do?",
      choices: [
        { name: "Build only", value: "build" },
        { name: "Build and push to Docker Hub", value: "build_push" },
      ],
    },
  ]);
}

async function buildLocalContainers(spinner: ora.Ora) {
  spinner.start("Building Docker containers locally...");
  execSync(`docker-compose -f ${COMPOSE_FILE_PATH} build`, {
    stdio: "inherit",
  });
  spinner.succeed(chalk.green("Docker containers built successfully!"));
}

async function buildDockerHubContainers(
  spinner: ora.Ora,
  dockerHubAccount: string,
  imageName: string,
  version: string,
  buildAction: string
) {
  const fullImageName = `${dockerHubAccount}/${imageName}:${version}`;

  try {
    spinner.text = "Updating docker-compose configuration...";
    await updateComposeFileWithImageTag(fullImageName);

    spinner.text = "Building Docker containers...";
    execSync(`docker-compose -f ${COMPOSE_FILE_PATH} build`, {
      stdio: "inherit",
    });

    if (buildAction === "build_push") {
      spinner.text = "Pushing to Docker Hub...";
      execSync(`docker-compose -f ${COMPOSE_FILE_PATH} push`, {
        stdio: "inherit",
      });
      spinner.succeed(
        chalk.green(
          `Successfully built and pushed ${fullImageName} to Docker Hub!`
        )
      );
    } else {
      spinner.succeed(chalk.green(`Successfully built ${fullImageName}`));
    }
  } catch (error: any) {
    throw new Error(`Docker build/push failed: ${error.message}`);
  }
}

export const build = async (options: BuildOptions) => {
  let spinner = ora("Checking environment...\n").start();

  try {
    await verifyDockerEnvironment(spinner);
    await verifyComposeFileExists(spinner);

    // Stop the initial spinner after verification
    spinner.stop();

    const buildTarget =
      options.target || (await promptForBuildTarget()).buildTarget;

    if (buildTarget === "local") {
      // Create new spinner for build process
      spinner = ora().start();
      await buildLocalContainers(spinner);
    } else {
      const dockerHubDetails: DockerHubDetails =
        options.account && options.image
          ? {
              dockerHubAccount: options.account,
              imageName: options.image,
              version: options.version || "latest",
            }
          : await promptForDockerHubDetails();

      const buildAction = options.push
        ? "build_push"
        : (await promptForBuildAction()).buildAction;

      // Create new spinner for build process
      spinner = ora().start();
      await buildDockerHubContainers(
        spinner,
        dockerHubDetails.dockerHubAccount,
        dockerHubDetails.imageName,
        dockerHubDetails.version,
        buildAction
      );
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
};
