import { spawn } from "child_process";
import os from "os";

let child = null;

function spawnServer() {
  if (child) {
    try { child.kill(); } catch(e) {}
  }
  child = spawn('node', ['./src/server.js'], { stdio: 'inherit' });
  child.on('exit', (code, signal) => {
    console.log('Server process exited', code, signal);
    setTimeout(spawnServer, 1000);
  });
}

function cpuPercentSamplems(intervalMs = 300) {
  const cpus1 = os.cpus();
  return new Promise((resolve) => {
    setTimeout(() => {
      const cpus2 = os.cpus();
      let idleDiff = 0, totalDiff = 0;
      for (let i = 0; i < cpus1.length; i++) {
        const t1 = cpus1[i].times;
        const t2 = cpus2[i].times;
        const t1Total = t1.user + t1.nice + t1.sys + t1.idle + t1.irq;
        const t2Total = t2.user + t2.nice + t2.sys + t2.idle + t2.irq;
        idleDiff += t2.idle - t1.idle;
        totalDiff += t2Total - t1Total;
      }
      const usage = 1 - idleDiff / totalDiff;
      resolve(usage * 100);
    }, intervalMs);
  });
}

(async function main() {
  spawnServer();
  setInterval(async () => {
    try {
      const percent = await cpuPercentSamplems(300);
      console.log(`Monitor: CPU ≈ ${percent.toFixed(1)}%`);
      if (percent > 70) {
        console.warn('CPU > 70% — restarting server child');
        if (child) child.kill('SIGTERM');
      }
    } catch (err) {
      console.error('Monitor error:', err);
    }
  }, 10000);
})();
