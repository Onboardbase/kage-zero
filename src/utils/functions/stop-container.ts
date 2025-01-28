import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function stopContainer(containerName: string): Promise<void> {
  try {
    await execAsync(`docker stop ${containerName}`);
  } catch (error) {
    throw new Error(`Failed to stop Docker container: ${containerName}`);
  }
}