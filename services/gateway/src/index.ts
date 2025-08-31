import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { shared } from '../common/src';

const app = express();
app.use(express.json());

app.use('/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/users', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/notifications', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));

app.get('/health', (_req, res) => res.json({ status: 'gateway ok', util: shared() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway service running on port ${PORT}`);
});
