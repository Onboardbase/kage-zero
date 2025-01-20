import { ProjectType } from "../detectors/project-detector";
import { mkdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";
import * as path from "path";

export interface Config {
  projectType: ProjectType;
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
      this.config.projectType,
      "Dockerfile"
    );

    let dockerfileContent = await readFile(templatePath, "utf-8");
    dockerfileContent = dockerfileContent.replace(
      /$PORT/g,
      String(this.config.port)
    );

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
      "production-dockercompose.yaml"
    );

    const { port, email, domain } = this.config;

    let dockerComposeContent = await readFile(
      dockerComposeTemplatePath,
      "utf-8"
    );
    dockerComposeContent = dockerComposeContent
      .replace("$PORT", port.toString())
      .replace("$EMAIL", email)
      .replace("$DOMAIN", domain);

    await writeFile(
      join(process.cwd(), "kage", "docker-compose.yml"),
      dockerComposeContent
    );

    const caddyFileTemplatePath = join(
      this.templatesPath,
      "caddy",
      "Caddyfile"
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
