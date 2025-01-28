import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

(async () => {
    const { stdout } = await execAsync(`netstat -ano | findstr "LISTENING" | findstr ":${80}"`);


  const lines = stdout.split('\n').filter(line => {
    // Match either 0.0.0.0:port or [::]:port
    return line.includes(`0.0.0.0:${80}`) || line.includes(`[::]:${80}`);
  });

  if (lines.length > 0) {
    const pid = lines[0].trim().split(/\s+/).pop() || '';
    console.log(pid)
    return { pid, isDocker: false };
  }

})();
