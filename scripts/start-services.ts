import { spawn } from 'child_process';
import path from 'path';

const services = ['auth', 'users', 'notifications', 'gateway'];
const processes: { name: string; proc: ReturnType<typeof spawn> }[] = [];

for (const service of services) {
  const servicePath = path.join(__dirname, '..', 'services', service);
  const proc = spawn('npm', ['run', 'start'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });
  processes.push({ name: service, proc });
}

function shutdown() {
  for (const { proc } of processes) {
    proc.kill();
  }
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

