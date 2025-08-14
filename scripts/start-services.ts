import { spawn } from 'child_process';
import path from 'path';

const services = ['auth', 'users', 'notifications', 'gateway'];
const ports: Record<string, number> = {
  auth: 3001,
  users: 3002,
  notifications: 3003,
  gateway: 3000,
};
const processes: { name: string; proc: ReturnType<typeof spawn> }[] = [];

for (const service of services) {
  const servicePath = path.join(__dirname, '..', 'services', service);
  const proc = spawn('npm', ['run', 'start'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });
  processes.push({ name: service, proc });
  const port = ports[service];
  if (port) {
    console.log(`Open http://localhost:${port} for ${service}`);
  }
}

function shutdown() {
  for (const { proc } of processes) {
    proc.kill();
  }
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

