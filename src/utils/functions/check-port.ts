import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: string;
  isDocker: boolean;
  containerName?: string;
}

export async function checkPort(port: number): Promise<ProcessInfo | null> {
  try {
    // First check if port is used by Docker container
    try {
      const { stdout: dockerPorts } = await execAsync(
        `docker ps --format {{.Names}} -f "publish=${port}"`
      );
      if (dockerPorts.trim()) {
        return {
          pid: '',
          isDocker: true,
          containerName: dockerPorts.trim()
        };
      }
    } catch {
      // Ignore docker command errors
    }

    // Then check for regular processes
    if (process.platform === "win32") {
      const { stdout } = await execAsync(`netstat -ano | findstr "LISTENING" | findstr ":${port}"`);
      const lines = stdout.split('\n').filter(line => {
        // Match either 0.0.0.0:port or [::]:port
        return line.includes(`0.0.0.0:${80}`) || line.includes(`[::]:${80}`);
      });
      if (lines.length > 0) {
        const pid = lines[0].trim().split(/\s+/).pop() || '';
        return { pid, isDocker: false };
      }
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} -s TCP:LISTEN -t`);
      if (stdout.length > 0) {
        const pid = stdout.trim();
        return { pid, isDocker: false };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}