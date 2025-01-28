import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function checkDockerStatus(): Promise<boolean> {
  try {
    await execAsync("docker info");
    return true;
  } catch (error) {
    return false;
  }
}
