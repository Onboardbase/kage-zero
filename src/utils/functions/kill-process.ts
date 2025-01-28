import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function killProcess(port: number): Promise<void> {
  try {
    if (process.platform === "win32") {
      // Get only LISTENING processes on the exact port
      const { stdout } = await execAsync(
        `netstat -ano | findstr "LISTENING" | findstr ":${port}"`
      );
      const lines = stdout.split("\n").filter((line) => {
        return (
          line.includes(`0.0.0.0:${port}`) || line.includes(`[::]:${port}`)
        );
      });

      if (lines.length > 0) {
        const pid = lines[0].split(/\s+/).pop();
        if (pid) {
          await execAsync(`taskkill /F /PID ${pid}`);
        }
      }
    } else {
      // For Unix/Linux, only kill processes that are listening on the port
      await execAsync(
        `sudo lsof -i :${port} -s TCP:LISTEN -t | xargs -r sudo kill -9`
      );
    }
  } catch (error) {
    throw new Error(
      `Failed to kill process on port ${port}: ${(error as Error).message}`
    );
  }
}
