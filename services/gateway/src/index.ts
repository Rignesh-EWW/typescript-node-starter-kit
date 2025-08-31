import express from 'express';
import http from 'http';
import { Request, Response } from 'express';
import { shared } from '../../common/src';

function proxy(target: string) {
  return (req: Request, res: Response) => {
    const url = new URL(req.originalUrl, target);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: req.method,
      headers: { ...req.headers, host: url.host },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
    proxyReq.on('error', (err) => {
      res.statusCode = 500;
      res.end(String(err));
    });
  };
}

const app = express();
app.use(express.json());

app.use('/auth', proxy('http://localhost:3001'));
app.use('/users', proxy('http://localhost:3002'));
app.use('/notifications', proxy('http://localhost:3003'));

app.get('/health', (_req, res) => res.json({ status: 'gateway ok', util: shared() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway service running on port ${PORT}`);
});
