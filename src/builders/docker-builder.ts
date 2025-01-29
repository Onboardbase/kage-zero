import { ProjectConfig } from "../detectors/project-detector";
import { mkdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";
import * as path from "path";

export interface Config {
  projectConfig: ProjectConfig;
  port: number;
  appName: string;
  domain: string;
  email: string;
}

export class DockerBuilder {
  private templatesPath = path.join(__dirname, "..", "templates");

  constructor(private config: Config) {}

  async build(): Promise<void> {
    await Promise.all([
      this.generateDockerfile(),
      this.generateDockerCompose(),
      this.generateEnvFile(),
    ]);
  }

  private async generateDockerfile(): Promise<void> {
    const templatePath = join(
      this.templatesPath,
      "docker",
      this.config.projectConfig.type,
      "Dockerfile"
    );

    let dockerfileContent = await readFile(templatePath, "utf-8");
    dockerfileContent = dockerfileContent.replaceAll("$PORT", this.config.port.toString())

    // safe create output folder
    await mkdir(join(process.cwd(), "kage"), { recursive: true });
    await writeFile(
      join(process.cwd(), "kage", "Dockerfile"),
      dockerfileContent
    );
  }

  private async generateDockerCompose(): Promise<void> {
    const dockerComposeTemplatePath = join(
      this.templatesPath,
      "docker-compose",
      this.config.projectConfig.isStatic ? "static-dockercompose.yaml" : "production-dockercompose.yaml"
    );

    const { appName, port, email, domain } = this.config;

    let dockerComposeContent = await readFile(
      dockerComposeTemplatePath,
      "utf-8"
    );
    dockerComposeContent = dockerComposeContent
      .replaceAll("$PORT", port.toString())
      .replaceAll("$EMAIL", email)
      .replaceAll("$DOMAIN", domain)
      .replaceAll("$APP_NAME", appName);

    await writeFile(
      join(process.cwd(), "kage", "docker-compose.yml"),
      dockerComposeContent
    );

    const caddyFileTemplatePath = join(
      this.templatesPath,
      "caddy",
      this.config.projectConfig.isStatic ? "Caddyfile.static" : "Caddyfile"
    );

    const caddyFileContent = await readFile(caddyFileTemplatePath, "utf-8");
    // safe create output folder
    await mkdir(join(process.cwd(), "kage", "caddy_config"), {
      recursive: true,
    });
    await writeFile(
      join(process.cwd(), "kage", "caddy_config", "Caddyfile"),
      caddyFileContent
    );
  }

  private async generateEnvFile(): Promise<void> {
    const envPath = join(process.cwd(), ".env");
    const exists = await stat(envPath).catch(() => false);
    const envContent = exists ? await readFile(envPath, "utf-8") : ""
    await mkdir(join(process.cwd(), "kage"), { recursive: true });
    await writeFile(join(process.cwd(), "kage", ".env"), envContent);
  }
}
